import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CentroListComponent } from './centro-list/centro-list.component';
import { CentroDetailComponent } from './centro-detail/centro-detail.component';
import { AtividadesComponent } from './atividades/atividades.component';
import { EventosComponent } from './eventos/eventos.component';
import { AliancaComponent } from './alianca/alianca.component';
import { RegionaisComponent } from './regionais/regionais.component';


const centros = "centros";
const centro_detail = "centro-detail"
const edit_centro = "edit-centro"
const atividades = "atividades";
const eventos = "eventos";
const alianca = "alianca";
const regionais = "regionais";

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
  path: regionais,
  component: RegionaisComponent
},
{
  path: centro_detail,
  component: CentroDetailComponent
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
