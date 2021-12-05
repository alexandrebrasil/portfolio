import { Component } from "@angular/core";
import { PortfolioDb } from "../db";

@Component({
    templateUrl: './ativos.component.html',
    styleUrls: [ './ativos.component.scss' ]
})
export class AtivosComponent {
    constructor(private db: PortfolioDb) {}

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

    async gerarBackup() {
        let backup = {
            ativos: await this.db.ativos.toArray(),
            transacoes: await this.db.eventos.toArray()
        }

        this.downloadFile(JSON.stringify(backup));
    }

    async carregarBackup(arquivos: FileList | null) {
        let arquivo = arquivos?.item(0);

        if(arquivo) {
            console.info("Carregando backup");

            const reader = new FileReader();
            
            reader.addEventListener('load', async (event) => {
                console.log("Load")
                if(event.loaded) {
                    console.log("Loaded")
                    let backup = JSON.parse(event.target?.result as string);

                    console.log("Backup", backup)

                    if(backup.ativos && backup.transacoes) {
                        await this.db.ativos.clear();
                        await this.db.eventos.clear();

                        console.log("Tabelas apagadas");

                        console.log((await this.db.ativos.bulkAdd(backup.ativos, {allKeys: true})).length, 'ativos importados');
                        console.log((await this.db.eventos.bulkAdd(backup.transacoes, {allKeys: true})).length, 'eventos importados');
                    }
                }
            });
            reader.readAsText(arquivo);
        }

    }

    private downloadFile(text: string) {
        let download =  document.createElement('a');
        const fileType = 'text/json';
        download.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(text)}`);
        download.setAttribute('download', 'portfolio.json');
    
        var event = new MouseEvent("click");
        download.dispatchEvent(event);
      }
}