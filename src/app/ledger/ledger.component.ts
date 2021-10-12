import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { from } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Ativo, Evento, PortfolioDb, TipoEvento } from "../db";

import * as moment from 'moment';

@Component({
    selector: 'portfolio-ledger',
    templateUrl: './ledger.component.html',
    styleUrls: [ './ledger.component.scss' ]
})
export class LedgerComponent implements OnChanges {
    colunas = ['data', 'tipo', 'unitario', 'quantidade', 'valorFinanceiro', 'valorContabil', 'acoes'];

    transacoes: TransacaoExtendida[];
    custoContabil: number;
    custoLiquido: number;
    quantidadeAtual: number;


    @Input()
    ativo: Ativo;

    constructor(private db: PortfolioDb) {
        
    }

    ngOnChanges(changes: SimpleChanges) {
        this.carregaTransacoes();
    }


    async removeTransacao(transacao: Evento) {
        if(transacao.id){
            await this.db.eventos.delete(transacao.id);
            this.carregaTransacoes();
        }
    }

    carregaTransacoes(){
        from(this.db.eventos.where('ativo').equals(this.ativo.ticker).sortBy('data'))
            .pipe(
                map(transacoes => transacoes.map(transacao => ({
                        ... transacao,
                        valorFinanceiro: 0,
                        valorFinanceiroAcumulado: 0,
                        valorContabil: 0,
                        valorContabilAcumulado: 0,
                        quantidadeAcumulada: 0,
                        quantidadeTransacao: 0
                    })
                )),
                tap(transacoes => transacoes.reduce((prev, curr) => {
                    curr.quantidadeTransacao = quantidade(curr, prev.quantidadeAcumulada);
                    curr.quantidadeAcumulada = prev.quantidadeAcumulada + curr.quantidadeTransacao;
                    return curr;
                }, transacoes[0])),
                tap(transacoes => transacoes.reduce((prev, curr) => {
                    let financeiro = valorFinanceiro(curr),
                        contabil = valorContabil(curr);

                    curr.valorContabil = contabil;
                    curr.valorFinanceiro = financeiro;
                    curr.valorContabilAcumulado = prev.valorContabilAcumulado + contabil;
                    curr.valorFinanceiroAcumulado = prev.valorFinanceiroAcumulado + financeiro;

                    return curr;
                }, transacoes[0]))
            )
            .subscribe(transacoes => {
                this.transacoes = transacoes;
                
                const ultimaTransacao = transacoes[transacoes.length - 1];
                this.custoContabil = ultimaTransacao?.valorContabilAcumulado || 0;
                this.custoLiquido = ultimaTransacao?.valorFinanceiroAcumulado || 0;
                this.quantidadeAtual = ultimaTransacao?.quantidadeAcumulada || 0;
            });
    }
}

interface TransacaoExtendida extends Evento {
    valorFinanceiro: number;
    valorContabil: number;

    valorFinanceiroAcumulado: number;
    valorContabilAcumulado: number;
    quantidadeAcumulada: number;
    quantidadeTransacao: number;
}

function quantidade(transacao: Evento, quantidadeAcumulada: number): number {
    switch(transacao.tipo) {
        case "compra": 
            return (transacao.quantidade || 0);
        case "venda":
            return -(transacao.quantidade || 0);
        case "bonificação":
            return quantidadeAcumulada * (transacao.multiplicador || 0) / 100;
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
            return ((transacao.valor || 0) - (transacao.taxas || 0)) * transacao.quantidadeAcumulada;
        default:
            return 0;
    }
}

function valorContabil(transacao: TransacaoExtendida): number {
    switch(transacao.tipo) {
        case "compra": 
        case "venda":
            return valorFinanceiro(transacao);
        case "bonificação":
            return -(transacao.valor || 0) * transacao.quantidadeTransacao;
        default:
            return 0;
    }   
}