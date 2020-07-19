import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CentroListComponent } from './centro-list/centro-list.component';
import { AtividadesComponent } from './atividades/atividades.component';
import { EventosComponent } from './eventos/eventos.component';
import { AliancaComponent } from './alianca/alianca.component';

const centros ="centros";
const atividades ="atividades";
const eventos ="eventos";
const alianca ="alianca";

const routes: Routes = [{
  path: centros,
  component: CentroListComponent
},
{
  path: atividades,
  component: AtividadesComponent
},
{
  path: eventos,
  component: EventosComponent
},
{
  path: alianca,
  component: AliancaComponent
},
{
  path: '**',
  redirectTo: alianca
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
