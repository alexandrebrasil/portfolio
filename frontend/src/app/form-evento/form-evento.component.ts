import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import * as moment from 'moment';
import { Ativo, PortfolioDb } from "../db";


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

    novoEvento: UntypedFormGroup;

    tituloQuantidade: string;
    tituloValor: string;
    tituloTaxas: string;
    tituloValorTotal: string;
    tituloMultiplicador: string;

    constructor(fb: UntypedFormBuilder, private db: PortfolioDb) {
        this.novoEvento = fb.group({
            tipo: ['compra', Validators.required],
            data: [moment(), Validators.required],
            dataEx: [{value: moment(), disabled: true}, Validators.required],
            quantidade: [null, Validators.required],
            multiplicador: [null, Validators.required],
            valor: [null, Validators.required],
            taxas: [null],
            valorTotal: {value: 0, disabled: true},
        });

        this.novoEvento.valueChanges.subscribe(v => {
            if(v.tipo === 'compra') {
                this.configuraCompra();
            } else if(v.tipo === 'venda') {
                this.configuraVenda();
            } else if(v.tipo === 'jcp') {
                this.configuraJCP();
            } else if(v.tipo === 'dividendos') {
                this.configuraDividendos();
            } else if(v.tipo === 'bonificação') {
                this.configuraBonificacao();
            } else if(v.tipo === 'desdobramento') {
                this.configuraDesdobramento();
            } else if(v.tipo === 'grupamento') {
                this.configuraGrupamento();
            } else if(v.tipo === 'amortização') {
                this.configuraAmortizacao();
            }
        });

        this.configuraCompra();
    }

    private configuraCompra() {
        let controls = this.novoEvento.controls;
        
        controls.quantidade.enable({emitEvent: false});
        controls.taxas.enable({emitEvent: false});
        controls.valor.enable({emitEvent: false})
        controls.dataEx.disable({emitEvent: false});
        controls.multiplicador.disable({emitEvent: false});

        this.tituloQuantidade = 'Quantidade adquirida';
        this.tituloValor = 'Preço (R$)';
        this.tituloTaxas = 'Corretagem e emolumentos';
        this.tituloValorTotal = 'Total desembolsado';

        let evento = this.novoEvento.value;

        controls.valorTotal.setValue(evento.quantidade * evento.valor + evento.taxas, {emitEvent: false});
    }

    private configuraVenda() {
        let controls = this.novoEvento.controls;
        
        controls.quantidade.enable({emitEvent: false});
        controls.taxas.enable({emitEvent: false});
        controls.valor.enable({emitEvent: false})
        controls.dataEx.disable({emitEvent: false});
        controls.multiplicador.disable({emitEvent: false});

        this.tituloQuantidade = 'Quantidade vendida';
        this.tituloTaxas = 'Corretagem e emolumentos';
        this.tituloValor = 'Preço (R$)';
        this.tituloValorTotal = 'Total recebido';

        let evento = this.novoEvento.value;

        controls.valorTotal.setValue(evento.quantidade * evento.valor - evento.taxas, {emitEvent: false});
    }

    private configuraJCP() {
        let controls = this.novoEvento.controls;
        
        controls.quantidade.disable({emitEvent: false});
        controls.taxas.disable({emitEvent: false});
        controls.valor.enable({emitEvent: false})
        controls.dataEx.enable({emitEvent: false});
        controls.multiplicador.disable({emitEvent: false});

        this.tituloValor = 'Provento bruto/ação (R$)';
        this.tituloTaxas = 'Imposto de renda';
        this.tituloValorTotal = 'Provento líquido/ação (R$)'

        let valor = this.novoEvento.value.valor,
            ir = valor * 0.15;
        
        controls.quantidade.setValue(null, {emitEvent: false});
        controls.taxas.setValue(ir, {emitEvent: false});
        controls.valorTotal.setValue(valor - ir, {emitEvent: false});
    }

    private configuraDividendos() {
        let controls = this.novoEvento.controls;

        controls.quantidade.disable({emitEvent: false});
        controls.taxas.disable({emitEvent: false});
        controls.valor.enable({emitEvent: false})
        controls.dataEx.enable({emitEvent: false});
        controls.multiplicador.disable({emitEvent: false});

        this.tituloValor = 'Provento/ação (R$)';

        let valor = this.novoEvento.value.valor;

        controls.taxas.setValue(0, {emitEvent: false});
        controls.valorTotal.setValue(valor, {emitEvent: false});
    }

    private configuraBonificacao() {
        let controls = this.novoEvento.controls;

        controls.quantidade.disable({emitEvent: false});
        controls.taxas.disable({emitEvent: false});
        controls.valor.enable({emitEvent: false})
        controls.dataEx.disable({emitEvent: false});
        controls.multiplicador.enable({emitEvent: false});

        this.tituloMultiplicador = 'Percentual bonificado';
        this.tituloValor = 'Preço contábil (R$)';
    }

    private configuraDesdobramento() {
        let controls = this.novoEvento.controls;

        controls.quantidade.disable({emitEvent: false});
        controls.taxas.disable({emitEvent: false});
        controls.dataEx.disable({emitEvent: false});
        controls.multiplicador.enable({emitEvent: false});
        controls.valor.disable({emitEvent: false})

        this.tituloMultiplicador = 'Multiplicador (1:X)';
    }

    private configuraGrupamento() {
        let controls = this.novoEvento.controls;

        controls.quantidade.disable({emitEvent: false});
        controls.taxas.disable({emitEvent: false});
        controls.dataEx.disable({emitEvent: false});
        controls.multiplicador.enable({emitEvent: false});
        controls.valor.disable({emitEvent: false})

        this.tituloMultiplicador = 'Multiplicador (X:1)';
    }

    private configuraAmortizacao() {
        let controls = this.novoEvento.controls;

        controls.quantidade.disable({emitEvent: false});
        controls.taxas.disable({emitEvent: false});
        controls.valor.enable({emitEvent: false})
        controls.dataEx.enable({emitEvent: false});
        controls.multiplicador.disable({emitEvent: false});

        this.tituloValor = 'Amortização/cota (R$)';

        let valor = this.novoEvento.value.valor;

        controls.taxas.setValue(0, {emitEvent: false});
        controls.valorTotal.setValue(valor, {emitEvent: false});
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
        
        this.novoEvento.reset({tipo: dados.tipo, data: dados.data, dataEx: dados.dataEx});
        this.onNovoEvento.emit()
    }

}