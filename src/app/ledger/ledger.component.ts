import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { from } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Ativo, Evento, PortfolioDb, TipoEvento, TransacaoExtendida } from "../db";


@Component({
    selector: 'portfolio-ledger',
    templateUrl: './ledger.component.html',
    styleUrls: [ './ledger.component.scss' ]
})
export class LedgerComponent implements OnChanges {
    colunas = ['data', 'tipo', 'unitario', 'quantidade', 'valorFinanceiro', 'valorContabil', 'resultado', 'acoes'];

    custoContabil: number;
    custoLiquido: number;
    quantidadeAtual: number;
    resultadoAcumulado: number;

    @Input()
    transacoes: TransacaoExtendida[];

    @Output()
    onDeleteTransacao = new EventEmitter<TransacaoExtendida>()

    ngOnChanges() {
        const ultimaTransacao = this.transacoes?.[this.transacoes?.length - 1];

        this.custoContabil = (-ultimaTransacao?.quantidadeAcumulada * ultimaTransacao?.precoMedio) || 0;
        this.custoLiquido = ultimaTransacao?.valorFinanceiroAcumulado || 0;
        this.quantidadeAtual = ultimaTransacao?.quantidadeAcumulada || 0;

        this.resultadoAcumulado = this.transacoes?.filter(tx => tx.tipo === 'venda').map(tx => tx.valorContabil - tx.precoMedio * (tx.quantidade || 0)).reduce((r1, r2) => r1 + r2, 0);
    }


    removeTransacao(transacao: TransacaoExtendida) {
        if(window.confirm(`Deseja prosseguir com a exclusão de ${transacao.tipo} de ${transacao.data}?`)){
            this.onDeleteTransacao.emit(transacao);
        }
    }
}


