import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HistoricoOperacoesComponent } from './historico-operacoes/historico-operacoes.component';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PortfolioDb } from './db';
import { LedgerComponent } from './ledger/ledger.component';

import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { TipoEventoPipe } from './pipes/tipo.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { PosicaoComponent } from './posicao/posicao.component';
import { FormEventoComponent } from './form-evento/form-evento.component';
import { NovoAtivoDialog } from './novo-ativo/novo-ativo.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

registerLocaleData(localePt);

@NgModule({
    declarations: [
        AppComponent,
        FormEventoComponent,
        HistoricoOperacoesComponent,
        LedgerComponent,
        NovoAtivoDialog,
        PortfolioComponent,
        PosicaoComponent,
        
        TipoEventoPipe
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the app is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }),
        ReactiveFormsModule,
    
        MatButtonModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,

        MatMomentDateModule  
    ],
    providers: [
        TipoEventoPipe,
        {provide: PortfolioDb, useClass: PortfolioDb},
        {provide: LOCALE_ID, useValue: 'pt-BR'},
        {provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL'},
        {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline', floatLabel: 'always'}}
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
