import { Component, computed, effect, inject, input, ResourceStatus, signal } from "@angular/core";
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { ActivatedRoute, Router } from "@angular/router";
import { tap } from "rxjs/operators";
import { MoedasService } from "../moedas.service";

@Component({
    templateUrl: 'edicao-moeda.component.html',
    styleUrl: 'edicao-moeda.component.scss',
    imports: [
        ReactiveFormsModule,
        MatButton,
        MatFormField,
        MatLabel,
        MatInput
    ]
})
export class EdicaoMoedaComponent {
    private moedasService = inject(MoedasService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    codigo = input<string>();
    nomeOriginal = computed(() => this.moeda.value()?.nome)

    protected moedaNaoEncontrada = signal(false);

    protected moeda = rxResource({
        request: () => this.codigo() ? this.codigo().toUpperCase() : undefined,
        loader: ({request}) => this.moedasService.get(request).pipe(tap(moeda => this.form.patchValue(moeda)))
    })

    constructor() {
        effect(() => {
            this.form.controls.codigo[this.codigo() ? 'disable' : 'enable']()
        });

        effect(() => {
            if(this.moeda.status() === ResourceStatus.Resolved && !this.moeda.value()) {
                this.router.navigate(['..'], {relativeTo: this.route})
            }
        })
    }

    protected form = new FormGroup({
        codigo: new FormControl<string>(null, [Validators.required, Validators.pattern("[A-Za-z]{3}")]),
        numero: new FormControl<number>(null, [Validators.required, Validators.pattern("[0-9]{3}")]),
        nome: new FormControl<string>(null, [Validators.required, Validators.pattern("^[A-Za-z].*")])
    })

    protected salvar() {
        this.moedasService.gravar(this.form.getRawValue())
            .subscribe(codigo => {
                this.router.navigate(['..'], {relativeTo: this.route});
            })
    }

    protected cancelar() {
        this.router.navigate(['..'], {relativeTo: this.route})
    }
}