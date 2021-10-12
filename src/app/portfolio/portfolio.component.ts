import { Component } from "@angular/core";
import { from, Observable } from "rxjs";

import { Ativo, PortfolioDb } from "../db";

@Component({
    templateUrl: './portfolio.component.html',
    styleUrls: [ './portfolio.component.scss' ]
})
export class PortfolioComponent {
    posicao$: Observable<Ativo[]>;

    constructor(private db: PortfolioDb) {
        this.posicao$ = from(db.ativos.orderBy('ticker').toArray());
    }

    async novaPosicao() {
        let idAtivo = await this.db.ativos.put({
            ticker: 'ITUB4',
            empresa: 'Itaú'
        });

        await this.db.eventos.put({
            ativo: idAtivo,
            tipo: 'compra',
            quantidade: 1000,
            valor: 34.56,
            data: '2021-03-01',
            taxas: 11.23
        });
    }
}