import { Component, OnInit } from '@angular/core';
import { CentroServiceService } from "./centro-service.service";
import { TipoConsultaCentro } from '../util/consulta-centros.enum';
import { Router } from "@angular/router";


@Component({
  selector: 'app-centro-list',
  templateUrl: './centro-list.component.html',
  styleUrls: ['./centro-list.component.css']
})
export class CentroListComponent implements OnInit {
  public centroData: any;
  tipo: { key: number, value: string };
  tipoPesquisa: { key: number, value: string }[] = [];
  argumentoPesquisa: string;
  campo: string;
  dadosCarregados = false;

  constructor(private svc: CentroServiceService, private router: Router) {
    this.campo = "Campo";

    for (const tipo in TipoConsultaCentro) {
      if (typeof TipoConsultaCentro[tipo] === 'number') {
        this.tipoPesquisa.push({ key: Number(TipoConsultaCentro[tipo]), value: tipo });
      }
    }
    this.tipo = this.tipoPesquisa[0];
  }

  ngOnInit(): void {
    this.svc.getAllCentros().then(data => {
      this.centroData = data;
    });
  }

  pesquisar() {
    this.svc.getCentro(this.argumentoPesquisa, this.tipo.key)
      .then((resultado: any) => {
        if (resultado) {
          this.centroData = resultado;
          this.dadosCarregados = true;
        }
      });
  }

  detalhe(id: string) {
    window.localStorage.setItem("centroID", id);
    this.router.navigate(['centro-detail']);
  }

}
