import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CentroServiceService } from "./centro-service.service";
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { RegionaisServiceService } from "../regionais/regionais-service.service";

import { CentroDetailComponent } from '../centro-detail/centro-detail.component';

import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-centro-list',
  templateUrl: './centro-list.component.html',
  styleUrls: ['./centro-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CentroListComponent implements AfterViewInit {
  displayedColumns: string[] = ['NOME_CURTO', 'REGIONAL', 'ENDERECO', 'CIDADE', 'PAIS'];
  displayedColumnsAlias = {
    "NOME_CURTO": "Nome Curto",
    "REGIONAL": "Regional",
    "ENDERECO": "Endereço",
    "CIDADE": "Cidade",
    "PAIS": "País"
  };

  dataSource: MatTableDataSource<centro>;
  expandedElement: centro | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;

  constructor(private svc: CentroServiceService, private regionaidService: RegionaisServiceService, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private matDialog: MatDialog) {
    iconRegistry.addSvgIcon(
      'lupa',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/lupa.svg'));
  }

  ngAfterViewInit() {
    this.svc.getAllCentros().then(data => {
      this.dataSource = new MatTableDataSource(data)
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  detalhe(id: string) {
    const data = id;
    this.matDialog.open(CentroDetailComponent, {
      data,
      position: { top: '1%' },
      maxHeight: '90vh',
      maxWidth: '40%',
      height: '100vh',
      width: '100vw',
      panelClass: 'custom-dialog-container'
    });
  }


}

export interface centro {
  NOME_CENTRO: string;
  NOME_CURTO: string;
  BAIRRO: string;
  CEP: string;
  ENDERECO: string;
  CIDADE: string;
  ESTADO: string;
  PAIS: string;
  CNPJ_CENTRO: string;
  DATA_FUNDACAO: string;
  ID_CENTRO: string;
}
