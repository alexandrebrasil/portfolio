import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Ativo, PortfolioDb } from "../db";
import { NovoAtivoDialog } from "../novo-ativo/novo-ativo.component";
import { Observable } from "rxjs";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatMiniFabButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatExpansionPanelContent } from "@angular/material/expansion";
import { NgFor, AsyncPipe } from "@angular/common";
import { PosicaoComponent } from "../posicao/posicao.component";


@Component({
    templateUrl: './historico-operacoes.component.html',
    styleUrls: ['./historico-operacoes.component.scss'],
    imports: [MatMiniFabButton, MatTooltip, MatIcon, MatSlideToggle, ReactiveFormsModule, MatAccordion, NgFor, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatExpansionPanelContent, PosicaoComponent, AsyncPipe]
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