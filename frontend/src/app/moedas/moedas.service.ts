import { inject, Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { Observable } from "rxjs";
import { Moeda } from "./moeda";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class MoedasService {
    private apollo = inject(Apollo);

    getAll(): Observable<Moeda[]> {
        return this.apollo.watchQuery<{moedas: Moeda[]}>(
                    {
                        query: gql`
                            query TodasAsMoedas {
                                moedas {
                                    codigo
                                    nome
                                    numero
                                }
                            }
                        `
                    })
                    .valueChanges
                    .pipe(
                        map(res => res.data.moedas)
                    );
    }

    get(codigo: String): Observable<Moeda> {
        return this.apollo.query<{moedas: Moeda[]}>({
            query: gql`
                query Moeda($codigo: String!) {
                    moedas(codigo: $codigo) {
                        codigo
                        nome
                        numero
                    }
                }
            `,
            variables: {codigo}
        })
        .pipe(
            map(res => res.data.moedas[0])
        );
    }

    gravar(moeda: Moeda): Observable<String> {
        return this.apollo.mutate<{moeda: string}>({
                mutation: gql`
                    mutation EdicaoMoeda($codigo: String!, $nome: String!, $numero: Int!) {
                        moeda(nome: $nome, codigo: $codigo, numero: $numero)
                    }
                `,
                variables: {
                    ... moeda,
                    codigo: moeda.codigo.toUpperCase()
                },
                refetchQueries: ['TodasAsMoedas']
            })
            .pipe(
                map(res => res.data.moeda)
            )
    }
}