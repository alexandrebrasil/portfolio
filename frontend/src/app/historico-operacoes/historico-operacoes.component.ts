import { Component, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Ativo, PortfolioDb } from "../db";
import { NovoAtivoDialog } from "../novo-ativo/novo-ativo.component";
import { Observable } from "rxjs";
import { FormControl } from "@angular/forms";


@Component({
    templateUrl: './historico-operacoes.component.html',
    styleUrls: [ './historico-operacoes.component.scss' ]
})
export class HistoricoOperacoesComponent {
    acoes$ = new Observable<Ativo[]>();
    fundos$ = new Observable<Ativo[]>();

    apenasAtivos = new FormControl(true);

    

    constructor(private db: PortfolioDb, private dialog: MatDialog) {
        this.atualizaPosicao();
        this.apenasAtivos.valueChanges.subscribe(_ => this.atualizaPosicao())
    }

    async atualizaPosicao() {
        let posicoesAtivas = this.apenasAtivos.value;

        console.log('Posições', posicoesAtivas);
        this.acoes$ = posicoesAtivas ? this.db.posicoesAtivas('ação') : this.db.ativosPorTipo("ação");
        this.fundos$ = posicoesAtivas  ? this.db.posicoesAtivas('fundo-imobiliario') : this.db.ativosPorTipo("fundo-imobiliario");
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