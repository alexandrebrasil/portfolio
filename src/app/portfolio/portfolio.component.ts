import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { from, Observable } from "rxjs";

import { Ativo, PortfolioDb } from "../db";
import { NovoAtivoDialog } from "./novo-ativo/novo-ativo.component";

@Component({
    templateUrl: './portfolio.component.html',
    styleUrls: [ './portfolio.component.scss' ]
})
export class PortfolioComponent {
    posicao$: Observable<Ativo[]>;

    constructor(private db: PortfolioDb, private dialog: MatDialog) {
        this.atualizaPosicao();
    }

    atualizaPosicao() {
        this.posicao$ = from(this.db.ativos.orderBy('ticker').toArray());
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