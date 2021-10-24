import { Component, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Ativo, PortfolioDb } from "../db";
import { NovoAtivoDialog } from "../novo-ativo/novo-ativo.component";


@Component({
    templateUrl: './historico-operacoes.component.html',
    styleUrls: [ './historico-operacoes.component.scss' ]
})
export class HistoricoOperacoesComponent {
    acoes$ = new EventEmitter<Ativo[]>();
    fundos$ = new EventEmitter<Ativo[]>();

    constructor(private db: PortfolioDb, private dialog: MatDialog) {
        this.atualizaPosicao();
    }

    async atualizaPosicao() {
        this.acoes$.emit(await this.db.ativosPorTipo("ação"));
        this.fundos$.emit(await this.db.ativosPorTipo("fundo-imobiliario"));
    }

    trackByAtivo(index: number, ativo: Ativo) {
        return ativo.ticker;
    }

    async novoAtivo() {
        this.dialog
            .open<NovoAtivoDialog, Ativo, Ativo>(NovoAtivoDialog, { disableClose: true, hasBackdrop: true })
            .afterClosed()
            .subscribe(ativo => {
                if(ativo) {
                    this.db.ativos.put({... ativo, ticker: ativo.ticker.toUpperCase()}, ativo.ticker)
                        .then(_ => this.atualizaPosicao());
                }
            });
    }
}