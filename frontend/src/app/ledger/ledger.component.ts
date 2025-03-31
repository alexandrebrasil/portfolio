import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { TransacaoExtendida } from "../db";
import { xirr, XirrInput, convertRate, RateInterval }  from 'node-irr';
import moment from "moment";

@Component({
    selector: 'portfolio-ledger',
    templateUrl: './ledger.component.html',
    styleUrls: ['./ledger.component.scss'],
    standalone: false
})
export class LedgerComponent implements OnChanges {
    colunas = ['data', 'data-ex', 'tipo', 'unitario', 'quantidade', 'valorFinanceiro', 'retornoAnual', 'retorno', 'pm', 'acoes'];

    resultadoFinanceiroAcumulado: number;
    custoLiquido: number;
    quantidadeAtual: number;
    resultadoAcumulado: number;

    hoje = new Date().toISOString().substring(0, 10);

    @Input('preco-mercado')
    precoMercado: number;

    @Input()
    set transacoes(transacoes: TransacaoExtendida[]) {
        this._transacoes = transacoes?.map(t => ({
            ... t, 
            possuiRetorno: t.tipo === 'compra',
            retorno: null,
            retornoAnual: null,
            finalizada: null
        }))
        
        this.preencheRetornos(this._transacoes);
    }
    
    _transacoes: TransacaoComRetorno[];

    @Output()
    onDeleteTransacao = new EventEmitter<TransacaoExtendida>()

    ngOnChanges() {
        const ultimaTransacao = this._transacoes?.[this._transacoes?.length - 1];

        this.custoLiquido = -ultimaTransacao?.quantidadeAcumulada * ultimaTransacao?.precoMedioFinanceiro || 0;
        this.quantidadeAtual = ultimaTransacao?.quantidadeAcumulada || 0;
        
        this.resultadoFinanceiroAcumulado = 
            this._transacoes
                ?.filter(tx => tx.tipo === 'venda')
                .map(tx => tx.tipo === 'venda' ? (tx.valorFinanceiro - tx.precoMedioFinanceiro * (tx.quantidade || 0)) : 0)
                .reduce((r1, r2) => r1 + r2, 0);

        this.resultadoAcumulado = 
            this._transacoes
                ?.filter(tx => tx.tipo === 'venda')
                .map(tx => tx.tipo === 'venda' ? (tx.valorContabil - tx.precoMedio * (tx.quantidade || 0)) : 0)
                .reduce((r1, r2) => r1 + r2, 0);
    }

    preencheRetornos(transacoes: TransacaoComRetorno[]) {
        transacoes?.forEach((t, idx) => {
            if(t.tipo === 'compra') {
                let quantidade = t.quantidade,
                    quantidadeAnterior = t.quantidadeAcumulada - t.quantidade,
                    transacoesIrr: XirrInput[] = [{amount: t.valorFinanceiro, date: t.data}],
                    dataUltimaVenda;


                
                for(let i = idx + 1; i < transacoes.length && quantidade > 0; i++) {
                    let transacaoAtual = transacoes[i];
                    if(transacaoAtual.tipo === "compra") {
                        continue;
                    } else if(transacaoAtual.tipo === 'venda') {
                        let quantidadeVendida = transacaoAtual.quantidade;

                        if(quantidadeAnterior > 0) {
                            quantidadeAnterior -= quantidadeVendida;
                            if(quantidadeAnterior >= 0) {
                                // Quantidade vendida não afetou a compra sendo calculada
                                quantidadeVendida = 0;
                            } else {
                                // Quantidade vendida que afeta esta compra é apenas o que superou a quantidade anterior
                                quantidadeVendida = -quantidadeAnterior;
                                quantidadeAnterior = 0;
                            }
                        }

                        if(quantidadeVendida > 0) {
                            if(quantidade < quantidadeVendida) {
                                quantidadeVendida = quantidade;
                            }
                            
                            let valorFinanceiro = (transacaoAtual.valorFinanceiro / transacaoAtual.quantidade) * quantidadeVendida;
    
                            transacoesIrr.push({amount: valorFinanceiro, date: transacaoAtual.data});
                            quantidade -= quantidadeVendida; 
                            dataUltimaVenda = moment(t.data);
                        }

                    } else if(transacaoAtual.tipo === 'desdobramento') {
                        quantidade *= transacaoAtual.multiplicador;
                        quantidadeAnterior *= transacaoAtual.multiplicador;
                    } else if(transacaoAtual.tipo === 'grupamento') {
                        quantidade /= transacaoAtual.multiplicador;
                        quantidadeAnterior /= transacaoAtual.multiplicador;
                    } else if(transacaoAtual.tipo === "bonificação") {
                        quantidade += quantidade * transacaoAtual.multiplicador / 100;
                        quantidadeAnterior += quantidadeAnterior * transacaoAtual.multiplicador / 100;
                    } else if(transacaoAtual.tipo === 'jcp') {
                        transacoesIrr.push({amount: transacaoAtual.valor * quantidade * 0.85, date: transacaoAtual.data})
                    } else {
                        transacoesIrr.push({amount: transacaoAtual.valor * quantidade, date: transacaoAtual.data})
                    }
                }

                if(quantidade > 0) {
                    transacoesIrr.push({amount: quantidade * this.precoMercado, date: moment().format("YYYY-MM-DD")})
                    dataUltimaVenda = moment()
                }

                t.finalizada = quantidade <= 0;
                t.possuiRetorno = true;

                let irr = xirr(transacoesIrr);
                t.retornoAnual = convertRate(irr.rate, RateInterval.Year)
                t.retorno = convertRate(irr.rate, irr.days)
            }
        });

    }


    removeTransacao(transacao: TransacaoExtendida) {
        if(window.confirm(`Deseja prosseguir com a exclusão de ${transacao.tipo} de ${transacao.data}?`)){
            this.onDeleteTransacao.emit(transacao);
        }
    }
}

type TransacaoComRetorno = TransacaoExtendida & {
    possuiRetorno: boolean;
    retorno: number;
    retornoAnual: number;
    finalizada: boolean;
}
