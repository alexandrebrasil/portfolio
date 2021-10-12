import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { TipoEvento } from "../db";

@Pipe({
    name: 'tipoEvento'
})
export class TipoEventoPipe implements PipeTransform {
    transform(value: any, ...args: any[]) {
        switch(value as TipoEvento) {
            case "bonificação": return "Bonificação";
            case "compra": return 'Compra';
            case "desdobramento": return "Desdobramento";
            case "dividendos": return "Pagamento de dividendos"
            case "grupamento": return "Grupamento";
            case "jcp": return "Pagamento de JCP";
            case "venda": return "Venda";
        }

        return value;
    }

}