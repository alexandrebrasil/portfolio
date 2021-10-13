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

    transacoes: TransacaoExtendida[];

    constructor(private db: PortfolioDb) {}

    ngOnChanges() {
        this.carregaTransacoes();
    }

    carregaTransacoes() {
        if(this.ativo) {
            this.db.transacoes(this.ativo.ticker)
                .subscribe(transacoes => this.transacoes = transacoes);
        }
    }

    async removeTransacao(transacao: TransacaoExtendida) {
        if(transacao.id){
            await this.db.eventos.delete(transacao.id);
            this.carregaTransacoes();
        }
    }
}