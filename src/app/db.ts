import Dexie from "dexie";
import { from, Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

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

    transacoes(ativo: string): Observable<Array<TransacaoExtendida>> {
        return from(this.eventos.where('ativo').equals(ativo).toArray())
            .pipe(
                map(transacoes => transacoes.sort(ordenacaoTransacoes)),
                map(transacoes => transacoes.map(transacao => ({
                        ... transacao,
                        valorFinanceiro: 0,
                        valorFinanceiroAcumulado: 0,
                        valorContabil: 0,
                        valorContabilAcumulado: 0,
                        quantidadeAcumulada: 0,
                        quantidadeTransacao: 0,
                        precoMedio: 0,
                        precoMedioFinanceiro: 0
                    })
                )),
                tap(transacoes => transacoes.reduce((prev, curr) => {
                    curr.quantidadeTransacao = quantidade(curr, prev.quantidadeAcumulada);
                    curr.quantidadeAcumulada = prev.quantidadeAcumulada + curr.quantidadeTransacao;

                    let financeiro = valorFinanceiro(curr),
                        contabil = valorContabil(curr);

                    curr.valorContabil = contabil;
                    curr.valorFinanceiro = financeiro;
                    curr.valorContabilAcumulado = prev.valorContabilAcumulado + contabil;
                    curr.valorFinanceiroAcumulado = prev.valorFinanceiroAcumulado + financeiro;

                    return curr;
                }, transacoes[0])),
                // Cálculo do preço médio contábil
                tap(transacoes => transacoes.reduce((precoMedioAnterior, tx) => {
                    if(tx.quantidadeAcumulada == 0) {
                        tx.precoMedio = precoMedioAnterior;
                        return 0;
                    }

                    if(tx.tipo !== 'venda') {
                        let quantidadePrevia = tx.quantidadeAcumulada - tx.quantidadeTransacao,
                            contabilPrevio = quantidadePrevia * precoMedioAnterior;

                        precoMedioAnterior = Math.abs((contabilPrevio - tx.valorContabil) / tx.quantidadeAcumulada);
                    }

                    tx.precoMedio = precoMedioAnterior;

                    return precoMedioAnterior;
                }, 0)),
                // Cálculo do preço médio financeiro
                tap(transacoes => transacoes.reduce((precoMedioAnterior, tx) => {
                    if(tx.quantidadeAcumulada == 0) {
                        tx.precoMedioFinanceiro = precoMedioAnterior;
                        return 0;
                    }

                    if(tx.tipo !== 'venda') {
                        let quantidadePrevia = tx.quantidadeAcumulada - tx.quantidadeTransacao,
                            financeiroPrevio = quantidadePrevia * precoMedioAnterior;

                        precoMedioAnterior = Math.abs((financeiroPrevio - tx.valorFinanceiro) / tx.quantidadeAcumulada);
                    }

                    tx.precoMedioFinanceiro = precoMedioAnterior;

                    return precoMedioAnterior;
                }, 0))
            );
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

export interface Evento {
    id?: number,
    ativo: string,
    tipo: TipoEvento
    data: string
    quantidade?: number
    multiplicador?: number
    dataEx?: string
    valor?: number
    taxas?: number
}

export interface TransacaoExtendida extends Evento {
    valorFinanceiro: number;
    valorContabil: number;

    valorFinanceiroAcumulado: number;
    valorContabilAcumulado: number;
    quantidadeAcumulada: number;
    quantidadeTransacao: number;

    precoMedio: number;
    precoMedioFinanceiro: number;
}


function ordenacaoTransacoes(t1: Evento, t2: Evento) {
    if(t1.data !== t2.data) {
        return t1.data.localeCompare(t2.data);
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
            return 0;
    }
}

function valorFinanceiro(transacao: TransacaoExtendida): number {
    switch(transacao.tipo) {
        case "compra": 
            return - ((transacao.quantidade || 0) * (transacao.valor || 0) + (transacao.taxas || 0));
        case "venda":
            return (transacao.quantidade || 0) * (transacao.valor || 0) - (transacao.taxas || 0);
        case "dividendos":
            return (transacao.valor || 0) * transacao.quantidadeAcumulada;
        case "jcp":
            return (transacao.valor || 0) * 0.85 * transacao.quantidadeAcumulada;
        case "amortização":
            return (transacao.valor || 0) * transacao.quantidadeAcumulada;
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