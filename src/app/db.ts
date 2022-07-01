import Dexie from "dexie";
import { forkJoin, from, Observable } from "rxjs";
import { map, mergeMap, tap } from "rxjs/operators";

export class PortfolioDb extends Dexie {
    ativos: Dexie.Table<Ativo, string>;
    eventos: Dexie.Table<Evento, number>;

    constructor() {
        super('portfolio');
        
        this.version(2).stores({
            eventos: 'id++,ativo,data',
            ativos: 'ticker'
        });

        this.version(3).stores({
            ativos: 'ticker,tipo'
        }).upgrade(tx => {
            return tx.table('ativos').toCollection().modify(ativo => ativo.tipo = 'ação')
        })

        this.version(4).stores({
            ativos: '&ticker,tipo'
        });

        this.eventos = this.table('eventos');
        this.ativos = this.table('ativos');
    }

    async ativosPorTipo(tipo: TipoAtivo) {
        return this.ativos.where('tipo').equals(tipo).sortBy('ticker');
    }

    posicoesAtivas(tipo: TipoAtivo) {
        return from(this.ativos.where('tipo').equals(tipo).sortBy('ticker'))
            .pipe(
                mergeMap(ativos => 
                    forkJoin(ativos.map(ativo => 
                        this.transacoes(ativo.ticker)
                            .pipe(
                                map(tx => {
                                    return {
                                        ... ativo, 
                                        posicaoAtual: tx?.[tx?.length - 1]
                                    }
                                })
                            )
                    ))
                ),
                map(ativos => ativos.filter(ativo => !!ativo.posicaoAtual?.quantidadeAcumulada))
            );
    }

    transacoes(ativo: string): Observable<Array<TransacaoExtendida>> {
        return from(this.eventos.where('ativo').equals(ativo).toArray())
            .pipe(
                map(transacoes => transacoes.sort(ordenacaoDataEx)),
                map(transacoes => transacoes.map(transacao => ({
                        ... transacao,
                        valorFinanceiro: 0,
                        valorContabil: 0,
                        quantidadeAcumulada: 0,
                        quantidadeTransacao: 0,
                        precoMedio: 0,
                        precoMedioFinanceiro: 0
                    })
                )),
                tap(transacoes => transacoes.reduce((prev, curr) => {
                    curr.quantidadeTransacao = quantidade(curr, prev.quantidadeAcumulada);
                    curr.quantidadeAcumulada = prev.quantidadeAcumulada + (afetaQuantidade(curr) ? curr.quantidadeTransacao : 0);

                    let financeiro = valorFinanceiro(curr),
                        contabil = valorContabil(curr);

                    curr.valorContabil = contabil;
                    curr.valorFinanceiro = financeiro;

                    return curr;
                }, transacoes[0])),
                tap(transacoes => calculaPrecoMedio(transacoes, 'precoMedio')),
                tap(transacoes => calculaPrecoMedio(transacoes, 'precoMedioFinanceiro')),
                map(transacoes => transacoes.sort(ordenacaoDataFinanceira))
            );
    }

    async atualizaPrecoAtivo(ativo: string, cotacao: number) {
        await this.ativos.update(ativo, {precoMercado: cotacao});
    }
}

export interface Ativo {
    ticker: string
    empresa: string
    tipo: TipoAtivo
    precoMercado: number
}

export type TipoAtivo = 'ação' | 'fundo-imobiliario';

export type TipoEvento = 'compra' | 'venda' | 'jcp' | 'dividendos' | 'bonificação' | 'grupamento' | 'desdobramento' | 'amortização';

export type Evento = Compra | Venda | JCP | Dividendos | Bonificacao | Grupamento | Desdobramento | Amortizacao;

export interface EventoBase {
    id: number,
    tipo: TipoEvento,
    ativo: string,
    data: string
}

export interface EventoTransacao extends EventoBase {
    tipo: 'compra' | 'venda',
    quantidade: number,
    valor: number,
    taxas: number
}
export interface Compra extends EventoTransacao {
    tipo: 'compra'    
}

export interface Venda extends EventoTransacao {
    tipo: 'venda'
}

export interface EventoMultiplicador extends EventoBase {
    tipo: 'bonificação' | 'grupamento' | 'desdobramento'
    multiplicador: number
}

export interface Grupamento extends EventoMultiplicador {
    tipo: 'grupamento'
}

export interface Desdobramento extends EventoMultiplicador {
    tipo: 'desdobramento'
}

export interface Bonificacao extends EventoMultiplicador {
    tipo: 'bonificação',
    valor: number
}

export interface EventoFinanceiro extends EventoBase {
    tipo: 'jcp' | 'dividendos' | 'amortização',
    valor: number,
    dataEx: string
}

export interface JCP extends EventoFinanceiro {
    tipo: 'jcp'
}

export interface Dividendos extends EventoFinanceiro {
    tipo: 'dividendos'
}

export interface Amortizacao extends EventoFinanceiro {
    tipo: 'amortização'
}

//FIXME: repensar transação extendida
export type TransacaoExtendida = Evento & {
    valorFinanceiro: number;
    valorContabil: number;

    quantidadeAcumulada: number;
    quantidadeTransacao: number;

    precoMedio: number;
    precoMedioFinanceiro: number;
}


function calculaPrecoMedio(transacoes: TransacaoExtendida[], preco: 'precoMedioFinanceiro' | 'precoMedio') {
    transacoes.reduce((precoMedioAnterior, tx) => {
        if(tx.quantidadeAcumulada == 0) {
            tx[preco] = precoMedioAnterior;
            return 0;
        }

        if(tx.tipo !== 'venda') {
            let quantidadePrevia = tx.quantidadeAcumulada - (afetaQuantidade(tx) ? tx.quantidadeTransacao : 0),
                valorPrevio = quantidadePrevia * precoMedioAnterior;

            precoMedioAnterior = (valorPrevio - tx[preco === 'precoMedio' ? 'valorContabil' : 'valorFinanceiro']) / tx.quantidadeAcumulada;
        }

        tx[preco] = precoMedioAnterior;

        return precoMedioAnterior;
    }, 0);
}

function ordenacaoDataEx(t1: Evento, t2: Evento) {
    let data1 = (t1.tipo === 'jcp' || t1.tipo === 'dividendos' || t1.tipo === 'amortização') ? t1.dataEx : t1.data,
        data2 = (t2.tipo === 'jcp' || t2.tipo === 'dividendos' || t2.tipo === 'amortização') ? t2.dataEx : t2.data;

    if(data1 !== data2) {
        return data1.localeCompare(data2);
    } 

    return ordemTipo(t1.tipo) - ordemTipo(t2.tipo);
}

function ordenacaoDataFinanceira(t1: Evento, t2: Evento) {
    let data1 = t1.data,
        data2 = t2.data;

    if(data1 !== data2) {
        return data1.localeCompare(data2);
    } 

    return ordemTipo(t1.tipo) - ordemTipo(t2.tipo);
}

function ordemTipo(tipo: TipoEvento) {
    if(tipo === 'compra' || tipo === 'venda') {
        return 0;
    } else if(tipo === 'bonificação' || tipo === 'desdobramento' || tipo === 'grupamento') {
        return 1;
    }

    return 2;
}

function quantidade(transacao: Evento, quantidadeAcumulada: number): number {
    switch(transacao.tipo) {
        case "compra": 
            return (transacao.quantidade || 0);
        case "venda":
            return -(transacao.quantidade || 0);
        case "bonificação":
            return Math.floor(quantidadeAcumulada * (transacao.multiplicador || 0) / 100);
        case "desdobramento":
            return Math.floor(quantidadeAcumulada * ((transacao.multiplicador || 0) - 1));
        case "grupamento":
            return - Math.ceil(quantidadeAcumulada * (1 - 1 / (transacao.multiplicador || 1)));
        default:
            return quantidadeAcumulada;
    }
}

function afetaQuantidade(transacao: Evento): boolean {
    switch(transacao.tipo) {
        case "compra": 
        case "venda":
        case "bonificação":
        case "desdobramento":
        case "grupamento":
            return true;
        default:
            return false;
    }
}

function valorFinanceiro(transacao: TransacaoExtendida): number {
    switch(transacao.tipo) {
        case "compra": 
            return - ((transacao.quantidade || 0) * (transacao.valor || 0) + (transacao.taxas || 0));
        case "venda":
            return (transacao.quantidade || 0) * (transacao.valor || 0) - (transacao.taxas || 0);
        case "dividendos":
            return (transacao.valor || 0) * transacao.quantidadeTransacao;
        case "jcp":
            return (transacao.valor || 0) * 0.85 * transacao.quantidadeTransacao;
        case "amortização":
            return (transacao.valor || 0) * transacao.quantidadeTransacao;
        default:
            return 0;
    }
}

function valorContabil(transacao: TransacaoExtendida): number {
    switch(transacao.tipo) {
        case "compra": 
        case "venda":
        case "amortização":
            return valorFinanceiro(transacao);
        case "bonificação":
            return -(transacao.valor || 0) * transacao.quantidadeTransacao;
        default:
            return 0;
    }   
}