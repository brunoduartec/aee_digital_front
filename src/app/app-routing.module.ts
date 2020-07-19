import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CentroListComponent } from './centro-list/centro-list.component';

const centro ="centros";

const routes: Routes = [{
  path: centro,
  component: CentroListComponent
},
{
  path: '**',
  redirectTo: centro
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
