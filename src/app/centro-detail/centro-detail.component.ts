import { Component, OnInit } from '@angular/core';
import { CentroDetailService } from "./centro-detail.service";

@Component({
  selector: 'app-centro-detail',
  templateUrl: './centro-detail.component.html',
  styleUrls: ['./centro-detail.component.css']
})
export class CentroDetailComponent implements OnInit {
  public centroDetail: any;
  public id: string;
  public params =
    [
      {
        "name": "NOME_CENTRO",
        "alias": "Nome"
      },
      {
        "name": "NOME_CURTO",
        "alias": "Nome Curto"
      },
      {
        "name": "BAIRRO",
        "alias": "Bairro"
      },
      {
        "name": "CEP",
        "alias": "CEP"
      },
      {
        "name": "ENDERECO",
        "alias": "Endereço"
      },
      {
        "name": "NUMERO_ENDERECO",
        "alias": "Número"
      },
      {
        "name": "CIDADE",
        "alias": "Cidade"
      },
      {
        "name": "ESTADO",
        "alias": "Estado"
      },
      {
        "name": "PAIS",
        "alias": "País"
      },
      {
        "name": "CNPJ_CENTRO",
        "alias": "CNPJ"
      },
      {
        "name": "DATA_FUNDACAO",
        "alias": "Fundação"
      }
    ]


  constructor(private svc: CentroDetailService) { }

  ngOnInit(): void {
    this.id = window.localStorage.getItem("centroID");
    console.log("PEGANDO O VALOR DE " + this.id)
    this.svc.getCentro(this.id).then(data => {
      this.centroDetail = data[0];
    });
  }

}
