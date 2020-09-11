import { Component, OnInit } from '@angular/core';
import { CentroDetailService } from "./centro-detail.service";
import { Router } from "@angular/router";
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


  constructor(private svc: CentroDetailService, private router: Router) { }

  ngOnInit(): void {
    this.id = window.localStorage.getItem("centroID");
    console.log("PEGANDO O VALOR DE " + this.id)
    this.svc.getCentro(this.id).then(data => {
      this.centroDetail = data[0];

      console.log(this.centroDetail)
    });
  }

  atualizar() {
    // window.localStorage.setItem()
    this.router.navigate(['edit-centro']);
  }

}
