import { Component, inject, OnInit, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { RouterLink, RouterOutlet } from "@angular/router";
import { Apollo, gql } from "apollo-angular";
import { Moeda } from "../moeda";
import { map } from "rxjs/operators";
import { MoedasService } from "../moedas.service";

@Component({
    templateUrl: 'lista-moeda.component.html',
    styleUrl: 'lista-moeda.component.scss',
    imports: [
        MatTableModule, MatButtonModule, MatIconModule, RouterLink, RouterOutlet
    ]
})
export class ListaMoedaComponent implements OnInit {
    private moedasService = inject(MoedasService);

    protected moedas = signal<Moeda[]>([]);

    ngOnInit(): void {
        this.moedasService
            .getAll()
            .subscribe(moedas => this.moedas.set(moedas));
    }
}