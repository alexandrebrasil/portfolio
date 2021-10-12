import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from 'moment';
import { Ativo, PortfolioDb, TipoEvento } from "../db";


@Component({
    selector: 'portfolio-form-evento',
    templateUrl: './form-evento.component.html',
    styleUrls: [ './form-evento.component.scss' ]
})
export class FormEventoComponent {
    @Input()
    ativo: Ativo;

    @Output()
    onNovoEvento = new EventEmitter<void>();
    novoEvento: FormGroup;

    constructor(fb: FormBuilder, private db: PortfolioDb) {
        this.novoEvento = fb.group({
            tipo: ['compra', Validators.required],
            data: [moment(), Validators.required],
            dataEx: [{value: moment(), disabled: true}, Validators.required],
            quantidade: [null, Validators.required],
            valor: [null, Validators.required],
            taxas: [null],
            valorTotal: {value: 0, disabled: true},
        });

        this.novoEvento.valueChanges.subscribe(v => {
            this.novoEvento.controls.valorTotal.setValue(v.valor * v.quantidade + v.taxas, {emitEvent: false})

            if(v.tipo === "jcp") {
                let ir = v.valor * 0.15;
                this.novoEvento.controls.taxas.setValue(ir, {emitEvent: false});
                this.novoEvento.controls.valorTotal.setValue(v.valor - ir, {emitEvent: false});
            } else if(v.tipo === "dividendos") {
                this.novoEvento.controls.taxas.setValue(0, {emitEvent: false});
                this.novoEvento.controls.valorTotal.setValue(v.valor, {emitEvent: false});
            }
        });

        this.novoEvento.controls.tipo.valueChanges.subscribe((tipo: TipoEvento) => {
            let possuiQuantidade = tipo === "compra" || tipo === "venda";
            let inputDeTaxas = tipo === "compra" || tipo === "venda";
            let possuiDataEx = tipo === "jcp" || tipo === "dividendos";

            this.novoEvento.controls.quantidade[possuiQuantidade ? 'enable' : 'disable']();
            if(!possuiQuantidade) {
                this.novoEvento.controls.quantidade.setValue(null);
            }
            this.novoEvento.controls.taxas[inputDeTaxas ? 'enable' : 'disable']();
            this.novoEvento.controls.dataEx[possuiDataEx ? 'enable' : 'disable']();
        })
    }

    async gravaNovoEvento() {
        const dados = this.novoEvento.value;
        let evento = {
            ... dados,
            data: dados.data.format('YYYY-MM-DD'),
            dataEx: dados.dataEx?.format('YYYY-MM-DD'),
            ativo: this.ativo.ticker
        };

        await this.db.eventos.add(evento);
        
        this.novoEvento.reset({tipo: dados.tipo, data: dados.data});
        this.onNovoEvento.emit()
    }

}