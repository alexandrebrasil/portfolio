import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Ativo } from "src/app/db";

@Component({
    templateUrl: './novo-ativo.component.html',
    styleUrls: [ './novo-ativo.component.scss' ]
})
export class NovoAtivoDialog {
    ativo: FormGroup;

    constructor(fb: FormBuilder, private dialogRef: MatDialogRef<NovoAtivoDialog, Ativo>){
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