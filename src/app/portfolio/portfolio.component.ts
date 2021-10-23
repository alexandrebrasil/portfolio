import { Component, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Ativo, PortfolioDb } from "../db";
import { NovoAtivoDialog } from "./novo-ativo/novo-ativo.component";


@Component({
    templateUrl: './portfolio.component.html',
    styleUrls: [ './portfolio.component.scss' ]
})
export class PortfolioComponent {
    posicao$ = new EventEmitter<Ativo[]>();

    constructor(private db: PortfolioDb, private dialog: MatDialog) {
        this.atualizaPosicao();
    }

    atualizaPosicao() {
        this.db.ativos.orderBy('ticker').toArray().then(txs => this.posicao$.emit(txs));
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