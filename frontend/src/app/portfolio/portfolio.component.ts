import { Component, EventEmitter, OnInit } from "@angular/core";
import { map, tap } from "rxjs/operators";
import { Ativo, PortfolioDb, TipoAtivo } from "../db";
import { NgTemplateOutlet, PercentPipe, CurrencyPipe } from "@angular/common";
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow } from "@angular/material/table";

@Component({
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.scss'],
    imports: [NgTemplateOutlet, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow, PercentPipe, CurrencyPipe]
})
export class PortfolioComponent implements OnInit {
    constructor(private db: PortfolioDb) {}

    colunas = ['empresa', 'ticker', 'quantidade', 'precoMedio', 'precoMercado', 'resultado', 'posicao', 'percentualCarteira']

    acoes$ = new EventEmitter<Posicao[]>();
    fundosImobiliarios$ = new EventEmitter<Posicao[]>();

    totalInvestidoAcoes: number;
    resultadoPosicaoAcoes: number;
    totalInvestidoFII: number;
    resultadoPosicaoFII: number;

    ngOnInit() {
        this.atualizaPosicoes();
    }

    atualizaPosicoes() {
        this.posicoes("ação", this.acoes$, 'totalInvestidoAcoes', 'resultadoPosicaoAcoes');
        this.posicoes("fundo-imobiliario", this.fundosImobiliarios$, "totalInvestidoFII", 'resultadoPosicaoFII');
    }

    private posicoes(tipo: TipoAtivo, emitter: EventEmitter<Posicao[]>, 
                    campoTotal: 'totalInvestidoAcoes' | 'totalInvestidoFII',
                    campoResultado: 'resultadoPosicaoAcoes' | 'resultadoPosicaoFII') {
        this.db.posicoesAtivas(tipo)
            .pipe(
                map(ativos => ativos.map(ativo => ({
                    ... ativo,
                    quantidade: ativo.posicaoAtual?.quantidadeAcumulada,
                    precoMedio: ativo.posicaoAtual?.precoMedioFinanceiro,
                    custoContabil: ativo.posicaoAtual?.precoMedio * ativo.posicaoAtual?.quantidadeAcumulada
                })))
            )
            .subscribe(posicoes => {
                this[campoTotal] = posicoes.reduce((total, p) => p.quantidade * p.precoMercado + total, 0);
                this[campoResultado] = posicoes.reduce((total, p) => p.quantidade * (p.precoMercado - p.precoMedio) + total, 0);
                emitter.emit(posicoes);
            });
    }

    async atualizaPreco(cotacao, posicao: Posicao) {
        if(cotacao && +cotacao != posicao.precoMercado) {
            await this.db.atualizaPrecoAtivo(posicao.ticker, +cotacao);
            this.atualizaPosicoes();
        }
    }

    trackByTicker(index: number, ativo: Ativo) {
        return ativo.ticker;
    }
}


interface Posicao extends Ativo {
    quantidade: number
    precoMedio: number
    precoMercado: number
    custoContabil: number;
}