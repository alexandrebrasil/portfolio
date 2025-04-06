import { Component, inject, OnInit, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { RouterLink, RouterOutlet } from "@angular/router";
import { InstituicaoFinanceira } from "../instituicao-financeira";
import { InstituicaoFinanceiraService } from "../instituicao-financeira.service";

@Component({
    templateUrl: 'lista-instituicao-financeira.component.html',
    styleUrl: 'lista-instituicao-financeira.component.scss',
    imports: [
        MatTableModule,
        MatIcon,
        MatButtonModule,
        RouterLink,
        RouterOutlet
    ]
})
export class ListaInstituicaoFinanceiraComponent implements OnInit {
    private instituicoesFinanceirasService = inject(InstituicaoFinanceiraService);

    protected instituicoesFinanceiras = signal<InstituicaoFinanceira[]>([]);

    ngOnInit(): void {
        this.instituicoesFinanceirasService.getAll().subscribe(ifs => this.instituicoesFinanceiras.set(ifs))
    }
}
