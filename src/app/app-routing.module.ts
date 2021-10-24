import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoricoOperacoesComponent } from './historico-operacoes/historico-operacoes.component';

const routes: Routes = [{
        component: HistoricoOperacoesComponent,
        path: 'historico'
    }, {
        path: '',
        redirectTo: '/historico',
        pathMatch: 'full'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
