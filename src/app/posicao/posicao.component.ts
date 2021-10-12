import { Component, Input } from "@angular/core";
import { Ativo } from "../db";

@Component({
    selector: 'portfolio-posicao',
    templateUrl: './posicao.component.html',
    styleUrls: [ './posicao.component.scss' ]
})
export class PosicaoComponent {
    @Input()
    ativo: Ativo;
}