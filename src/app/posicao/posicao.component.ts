import { TEXT_COLUMN_OPTIONS } from "@angular/cdk/table";
import { Component, Input, OnChanges } from "@angular/core";
import { Ativo, PortfolioDb, TransacaoExtendida } from "../db";

@Component({
    selector: 'portfolio-posicao',
    templateUrl: './posicao.component.html',
    styleUrls: [ './posicao.component.scss' ]
})
export class PosicaoComponent implements OnChanges {
    @Input()
    ativo: Ativo;

    colunas = ['data', 'valor', 'quantidade', 'resultadoFinanceiro', 'resultadoContabil'];

    transacoes: TransacaoExtendida[];
    quantidadeAtual: number;
    precoMedio: number;
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
        this.custoContabil = ultimaTransacao?.precoMedio * ultimaTransacao?.quantidadeAcumulada;
        
        this.operacoesFechadas = transacoes.filter(tx => tx.tipo === "venda").map(venda => ({
            data: venda.data,
            valor: venda.valorFinanceiro,
            quantidade: venda.quantidade || 0,
            resultadoFinanceiro: venda.valorFinanceiro - venda.precoMedioFinanceiro * (venda.quantidade || 0),
            resultadoContabil: venda.valorFinanceiro - venda.precoMedio * (venda.quantidade || 0)
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
    resultadoFinanceiro: number;
    resultadoContabil: number;
}