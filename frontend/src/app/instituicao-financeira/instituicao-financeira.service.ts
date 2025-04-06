import { inject, Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { Observable } from "rxjs";
import { InstituicaoFinanceira } from "./instituicao-financeira";
import { map, tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class InstituicaoFinanceiraService {
    private apollo = inject(Apollo);

    getAll(): Observable<InstituicaoFinanceira[]> {
        return this.apollo.watchQuery<{instituicoesFinanceiras: InstituicaoFinanceira[]}>({
            query: gql`
                query ListaInstituicoesFinanceiras {
                    instituicoesFinanceiras {
                        id
                        nome
                        moeda {
                            nome
                        }
                    }
                }
            `
        })
        .valueChanges
        .pipe(
            map(res => res.data.instituicoesFinanceiras)
        )
    }

    get(id: number) : Observable<InstituicaoFinanceira> {
        return this.apollo.query<{instituicoesFinanceiras: InstituicaoFinanceira}>({
                query: gql`
                    query InstituicaoFinanceira($id: ID) {
                        instituicoesFinanceiras(id: $id) {
                            id
                            nome
                            moeda {
                                codigo
                            }
                        }
                    }
                `,
                variables: {id}
            })
            .pipe(
                map(res => res.data.instituicoesFinanceiras[0]),
            )
    }

    salvar(id: number, {nome, moeda}): Observable<number> {
        return this.apollo.mutate<{instituicaoFinanceira: number}>({
                mutation: gql`
                    mutation SalvarInstituicaoFinanceira($id: ID, $nome: String!, $moeda: String!) {
                        instituicaoFinanceira(id: $id, nome: $nome, moeda: $moeda)
                    }
                `,
                variables: {id, nome, moeda},
                refetchQueries: ['ListaInstituicoesFinanceiras']
            })
            .pipe(
                map(res => res.data.instituicaoFinanceira)
            )
    }
}