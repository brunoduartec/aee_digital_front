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
import { RegionaisComponent } from './regionais/regionais.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    CentroListComponent,
    EventosComponent,
    AtividadesComponent,
    AliancaComponent,
    RegionaisComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatListModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
