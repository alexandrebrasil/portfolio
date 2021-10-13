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
    colunas = ['data', 'tipo', 'unitario', 'quantidade', 'valorFinanceiro', 'valorContabil', 'acoes'];

    custoContabil: number;
    custoLiquido: number;
    quantidadeAtual: number;

    @Input()
    transacoes: TransacaoExtendida[];

    @Output()
    onDeleteTransacao = new EventEmitter<TransacaoExtendida>()

    ngOnChanges() {
        const ultimaTransacao = this.transacoes?.[this.transacoes?.length - 1];

        this.custoContabil = ultimaTransacao?.valorContabilAcumulado || 0;
        this.custoLiquido = ultimaTransacao?.valorFinanceiroAcumulado || 0;
        this.quantidadeAtual = ultimaTransacao?.quantidadeAcumulada || 0;
    }


    removeTransacao(transacao: TransacaoExtendida) {
        if(window.confirm(`Deseja prosseguir com a exclusão de ${transacao.tipo} de ${transacao.data}?`)){
            this.onDeleteTransacao.emit(transacao);
        }
    }
}


