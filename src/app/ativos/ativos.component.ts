import { Component, OnInit } from "@angular/core";
import { from, Observable } from "rxjs";
import { Ativo, PortfolioDb } from "../db";

@Component({
    templateUrl: './ativos.component.html',
    styleUrls: [ './ativos.component.scss' ]
})
export class AtivosComponent implements OnInit {
    constructor(private db: PortfolioDb) {}

    acoes$: Observable<Ativo[]>;
    fiis$: Observable<Ativo[]>;

    ngOnInit(): void {
        this.acoes$ = from(this.db.ativosPorTipo("ação"));
        this.fiis$ = from(this.db.ativosPorTipo("fundo-imobiliario"));
    }

    async atualiza(arquivos: FileList | null) {
        let arquivo = arquivos?.item(0);
        if(arquivo) {
            console.group("Carga de cotações");
            console.info("Carregando ativos cadastrados");
            let ativos = await this.db.ativos.toArray();
            
            console.info(`Carregando arquivo ${arquivo.name} para carga de cotações`);
            const reader = new FileReader();
            
            reader.addEventListener('load', (event) => {
                if(event.loaded) {
                    let linhas = (event.target?.result as string).split('\n');

                    linhas.forEach(linha => {
                        let ticker = linha.substr(12, 12).trim();
                        let ativo = ativos.find(ativo => ativo.ticker === ticker);
                        if(ativo) {
                            let preco = +linha.substr(108, 13)/100;
                            console.info(`Atualizando preço de ${ticker} para ${preco}`);
                            this.db.ativos.update(ticker, {precoMercado: preco});
                        }
                    })
                }

                console.groupEnd();
            });
            reader.readAsText(arquivo);
        }
        
    }
}