export interface InstituicaoFinanceira {
    id: number;
    nome: string;
    moeda: {
        codigo: string
        nome: string
    }
}