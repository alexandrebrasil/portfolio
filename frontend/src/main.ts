import { enableProdMode, LOCALE_ID, DEFAULT_CURRENCY_CODE, importProvidersFrom, inject } from '@angular/core';


import { environment } from './environments/environment';
import { TipoEventoPipe } from './app/pipes/tipo.pipe';
import { PortfolioDb } from './app/db';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ReactiveFormsModule } from '@angular/forms';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { AppComponent } from './app/app.component';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { HistoricoOperacoesComponent } from './app/historico-operacoes/historico-operacoes.component';
import { AtivosComponent } from './app/ativos/ativos.component';
import { PortfolioComponent } from './app/portfolio/portfolio.component';
import { ListaMoedaComponent } from './app/moedas/lista/lista-moeda.component';
import { EdicaoMoedaComponent } from './app/moedas/edicao/edicao-moeda.component';

if (environment.production) {
  enableProdMode();
}

registerLocaleData(localePt);

const routes: Routes = [{
  component: HistoricoOperacoesComponent,
  path: 'historico'
}, { 
  component: AtivosComponent,
  path: 'ativos'
}, { 
  component: PortfolioComponent,
  path: 'portfolio'
}, {
  path: '',
  redirectTo: '/historico',
  pathMatch: 'full'
}, {
  component: ListaMoedaComponent,
  path: 'moedas',
  children: [
      {
          component: EdicaoMoedaComponent,
          path: 'nova'
      }, {
        component: EdicaoMoedaComponent,
        path: ':codigo'
      }
  ]
}
];

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the app is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }), ReactiveFormsModule),
        TipoEventoPipe,
        provideMomentDateAdapter(),
        { provide: PortfolioDb, useClass: PortfolioDb },
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', floatLabel: 'always' } },
        provideAnimations(),
        provideHttpClient(),
        provideRouter(routes, withComponentInputBinding()),
        provideApollo(() => {
          const httpLink = inject(HttpLink);
 
            return {
              link: httpLink.create({ uri: environment.graphQLEndpoint }),
              cache: new InMemoryCache(),
            };
        })
    ]
})
  .catch(err => console.error(err));
