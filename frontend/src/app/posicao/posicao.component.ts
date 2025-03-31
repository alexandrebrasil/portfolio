import { TEXT_COLUMN_OPTIONS } from "@angular/cdk/table";
import { Component, Input, OnChanges } from "@angular/core";
import { Ativo, PortfolioDb, TransacaoExtendida } from "../db";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { NgIf, DecimalPipe, CurrencyPipe, DatePipe } from "@angular/common";
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow } from "@angular/material/table";
import { FormEventoComponent } from "../form-evento/form-evento.component";
import { LedgerComponent } from "../ledger/ledger.component";

@Component({
    selector: 'portfolio-posicao',
    templateUrl: './posicao.component.html',
    styleUrls: ['./posicao.component.scss'],
    imports: [MatTabGroup, MatTab, NgIf, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow, FormEventoComponent, LedgerComponent, DecimalPipe, CurrencyPipe, DatePipe]
})
export class PosicaoComponent implements OnChanges {
    @Input()
    ativo: Ativo;

    colunas = ['data', 'quantidade', 'precoVenda', 'valor', 'precoMedioFinanceiro', 'resultadoFinanceiro', 'precoMedioContabil', 'resultadoContabil'];

    transacoes: TransacaoExtendida[];
    quantidadeAtual: number;
    precoMedio: number;
    precoMedioContabil: number;
    custoContabil: number;

    operacoesFechadas: Operacao[];
    resultadoContabilAcumulado: number;
    resultadoFinanceiroAcumulado: number;

    constructor(private db: PortfolioDb) {}

    ngOnChanges() {
        this.carregaTransacoes();
    }

    carregaTransacoes() {
        if(this.ativo) {
            this.db.transacoes(this.ativo.ticker)
                .subscribe(transacoes => this.atualizaInformacoes(transacoes));
        }
    }

    atualizaInformacoes(transacoes: TransacaoExtendida[]) {
        this.transacoes = transacoes;
        let ultimaTransacao = transacoes?.[transacoes?.length - 1];

        this.quantidadeAtual = ultimaTransacao?.quantidadeAcumulada;
        this.precoMedio = ultimaTransacao?.precoMedioFinanceiro;
        this.precoMedioContabil = ultimaTransacao?.precoMedio;
        this.custoContabil = ultimaTransacao?.precoMedio * ultimaTransacao?.quantidadeAcumulada;

        this.operacoesFechadas = transacoes.filter(tx => tx.tipo === "venda").map(venda => ({
            data: venda.data,
            valor: venda.valorFinanceiro,
            quantidade: venda.tipo === 'venda' ? (venda.quantidade || 0) : 0,
            precoMedioFinanceiro: venda.precoMedioFinanceiro,
            resultadoFinanceiro: venda.valorFinanceiro - venda.precoMedioFinanceiro * (venda.tipo === 'venda' ? (venda.quantidade || 0) : 0),
            precoMedioContabil: venda.precoMedio,
            resultadoContabil: venda.valorFinanceiro - venda.precoMedio * (venda.tipo === 'venda' ? (venda.quantidade || 0) : 0),
            precoVenda: venda.tipo === 'venda' && venda.valor
        }));

        this.resultadoFinanceiroAcumulado = this.operacoesFechadas.reduce((res, op) => res + op.resultadoFinanceiro, 0);
        this.resultadoContabilAcumulado = this.operacoesFechadas.reduce((res, op) => res + op.resultadoContabil, 0);
    }

    async removeTransacao(transacao: TransacaoExtendida) {
        if(transacao.id){
            await this.db.eventos.delete(transacao.id);
            this.carregaTransacoes();
        }
    }
}

interface Operacao {
    data: string;
    quantidade: number;
    precoVenda: number
    precoMedioFinanceiro: number;
    resultadoFinanceiro: number;
    precoMedioContabil: number;
    resultadoContabil: number;
}