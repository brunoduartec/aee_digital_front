import { Component, OnInit, Input } from '@angular/core';
import { AtividadesCentroService } from './atividades-centro.service';


import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-atividades-centro',
  templateUrl: './atividades-centro.component.html',
  styleUrls: ['./atividades-centro.component.css']
})
export class AtividadesCentroComponent implements OnInit {

  public dataSource: any;
  displayedColumns: string[] = ['NOME_ATIVIDADE', 'HORINI', 'HORFIM', 'DIA_SEMANA', 'NUMERO_TURMA'];
  displayedColumnsAlias = {
    "NOME_ATIVIDADE": "Nome",
    "HORINI": "Início",
    "HORFIM": "Término",
    "DIA_SEMANA": "Dia",
    "NUMERO_TURMA": "Turma"
  };

  constructor(private svc: AtividadesCentroService) { }

  @Input()
  set id(id: string) {
    this.svc.getAtividadesCentro(id).then(data => {
      this.dataSource = data;
    });
  }

  ngOnInit(): void {
  }

  atualizar(dataToEdit) {
    this.svc.updateAtividadeCentro(dataToEdit).then(data => {
    })
  }

}

export interface atividadeCentro {
  'ID_ATIVIDADE_CENTRO', 'ID_CENTRO', 'ID_ATIVIDADE', 'HORINI', 'HORFIM', 'DIA_SEMANA', 'NUMERO_TURMA'
}
