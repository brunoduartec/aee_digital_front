import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list'
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
import { RegionaisPipe } from './util/pipes/regionais.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';

import { CentroDetailComponent } from './centro-detail/centro-detail.component';

import { EditInlineComponent } from './edit-inline/edit-inline.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AtividadesCentroComponent } from './atividades-centro/atividades-centro.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    CentroListComponent,
    EventosComponent,
    AtividadesComponent,
    AliancaComponent,
    RegionaisComponent,
    RegionaisPipe,
    CentroDetailComponent,
    EditInlineComponent,
    AtividadesCentroComponent
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
    BrowserAnimationsModule,
    MatSelectModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
