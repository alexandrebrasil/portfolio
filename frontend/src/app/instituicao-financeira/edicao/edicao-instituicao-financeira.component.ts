import { Component, computed, effect, inject, input, ResourceStatus } from "@angular/core";
import { InstituicaoFinanceiraService } from "../instituicao-financeira.service";
import { rxResource, toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatOption, MatSelect } from "@angular/material/select";
import { MoedasService } from "src/app/moedas/moedas.service";
import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute, Router } from "@angular/router";
import { tap } from "rxjs/operators";

@Component({
    templateUrl: 'edicao-instituicao-financeira.component.html',
    styleUrl: 'edicao-instituicao-financeira.component.scss',
    imports: [
        MatButtonModule, MatFormField, MatInput, MatLabel, MatSelect, MatOption, ReactiveFormsModule
    ]
})
export class EdicaoInstituicaoFinanceiraComponent {
    private instituicaoFinanceiraService = inject(InstituicaoFinanceiraService);
    private moedasService = inject(MoedasService);

    private router = inject(Router);
    private route = inject(ActivatedRoute);

    id = input<number>();
    moedas = toSignal(this.moedasService.getAll());

    protected instituicaoFinanceira = rxResource({
        request: () => this.id() ? this.id() : undefined,
        loader: ({request}) => this.instituicaoFinanceiraService.get(request)
    })

    protected nomeOriginal = computed(() => this.instituicaoFinanceira.value()?.nome);

    protected form = new FormGroup({
        nome: new FormControl<string>(null, [Validators.required, Validators.pattern("^[A-Za-z].*")]),
        moeda: new FormControl<string>(null, Validators.required)
    })

    constructor() {
        effect(() => {
            if(this.instituicaoFinanceira.value()) {
                console.log("Pathc");
                this.form.patchValue({
                    nome: this.instituicaoFinanceira.value().nome,
                    moeda: this.instituicaoFinanceira.value().moeda.codigo
                })
            } else {
                this.form.reset();
            }
        })
    }

    protected salvar() {
        this.instituicaoFinanceiraService.salvar(this.id(), this.form.getRawValue())
                .subscribe(() => this.cancelar())
    }

    protected cancelar() {
        this.router.navigate(['..'], {relativeTo: this.route});
    }    
}