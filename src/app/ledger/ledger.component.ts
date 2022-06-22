import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { TransacaoExtendida } from "../db";


@Component({
    selector: 'portfolio-ledger',
    templateUrl: './ledger.component.html',
    styleUrls: [ './ledger.component.scss' ]
})
export class LedgerComponent implements OnChanges {
    colunas = ['data', 'data-ex', 'tipo', 'unitario', 'quantidade', 'valorFinanceiro', 'resultadoFinanceiro', 'resultado', 'acoes'];

    resultadoFinanceiroAcumulado: number;
    custoLiquido: number;
    quantidadeAtual: number;
    resultadoAcumulado: number;

    @Input()
    transacoes: TransacaoExtendida[];

    @Output()
    onDeleteTransacao = new EventEmitter<TransacaoExtendida>()

    ngOnChanges() {
        const ultimaTransacao = this.transacoes?.[this.transacoes?.length - 1];

        this.custoLiquido = -ultimaTransacao?.quantidadeAcumulada * ultimaTransacao?.precoMedioFinanceiro || 0;
        this.quantidadeAtual = ultimaTransacao?.quantidadeAcumulada || 0;
        
        this.resultadoFinanceiroAcumulado = this.transacoes?.filter(tx => tx.tipo === 'venda').map(tx => tx.valorFinanceiro - tx.precoMedioFinanceiro * (tx.quantidade || 0)).reduce((r1, r2) => r1 + r2, 0);
        this.resultadoAcumulado = this.transacoes?.filter(tx => tx.tipo === 'venda').map(tx => tx.valorContabil - tx.precoMedio * (tx.quantidade || 0)).reduce((r1, r2) => r1 + r2, 0);
    }


    removeTransacao(transacao: TransacaoExtendida) {
        if(window.confirm(`Deseja prosseguir com a exclusão de ${transacao.tipo} de ${transacao.data}?`)){
            this.onDeleteTransacao.emit(transacao);
        }
    }
}


