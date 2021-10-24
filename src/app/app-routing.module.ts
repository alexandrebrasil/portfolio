import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoricoOperacoesComponent } from './historico-operacoes/historico-operacoes.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

const routes: Routes = [{
        component: HistoricoOperacoesComponent,
        path: 'historico'
    }, { 
        component: PortfolioComponent,
        path: 'portfolio'
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
