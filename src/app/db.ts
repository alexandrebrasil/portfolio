import Dexie from "dexie";

export class PortfolioDb extends Dexie {
    ativos: Dexie.Table<Ativo, string>;
    eventos: Dexie.Table<Evento, number>;

    constructor() {
        super('portfolio');
        console.log("Criando DB");
        this.version(2).stores({
            eventos: 'id++,ativo,data',
            ativos: 'ticker'
        });

        this.eventos = this.table('eventos');
        this.ativos = this.table('ativos');
    }
}

export interface Ativo {
    ticker: string
    empresa: string
}

export type TipoEvento = 'compra' | 'venda' | 'jcp' | 'dividendos' | 'bonificação' | 'grupamento' | 'desdobramento';

export interface Evento {
    id?: number,
    ativo: string,
    tipo: TipoEvento
    data: string
    quantidade?: number
    multiplicador?: number
    dataEx?: string
    valor?: number
    taxas?: number
}

const db = new Dexie('portfolio');
db.version(1).stores({
    evento: `tipo, quantidade, dataEx, data`
});