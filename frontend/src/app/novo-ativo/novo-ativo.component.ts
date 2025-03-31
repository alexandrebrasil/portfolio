import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { Ativo } from "src/app/db";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatButton } from "@angular/material/button";

@Component({
    templateUrl: './novo-ativo.component.html',
    styleUrls: ['./novo-ativo.component.scss'],
    imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatButton, MatDialogContent, MatDialogTitle, MatDialogActions]
})
export class NovoAtivoDialog {
    ativo: UntypedFormGroup;

    constructor(fb: UntypedFormBuilder, private dialogRef: MatDialogRef<NovoAtivoDialog, Ativo>){
        this.ativo = fb.group({
            ticker: [null, Validators.required],
            empresa: [null, Validators.required],
            tipo: [null, Validators.required],
            precoMercado: [null]
        })
    }

    fechar() {
        this.dialogRef.close();
    }

    gravar() {
        this.dialogRef.close(this.ativo.value);
    }
}