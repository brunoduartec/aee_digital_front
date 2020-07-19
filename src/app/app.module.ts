import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatListModule} from '@angular/material/list'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { CentroListComponent } from './centro-list/centro-list.component';
import { EventosComponent } from './eventos/eventos.component';
import { AtividadesComponent } from './atividades/atividades.component';
import { AliancaComponent } from './alianca/alianca.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    CentroListComponent,
    EventosComponent,
    AtividadesComponent,
    AliancaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
