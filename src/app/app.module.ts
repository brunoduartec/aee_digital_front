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
import { CentroDetailComponent } from './centro-detail/centro-detail.component';
import { ReactiveFormsModule } from "@angular/forms";
import { InputEditorModule } from 'angular-inline-editors';



import { MatDialogModule } from '@angular/material/dialog';
import { EditInlineComponent } from './edit-inline/edit-inline.component';

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
    EditInlineComponent
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
    ReactiveFormsModule,
    MatDialogModule,
    InputEditorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
