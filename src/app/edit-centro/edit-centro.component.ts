import { Component, OnInit, Inject } from '@angular/core';
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { EditCentroService } from "./edit-centro.service";


@Component({
  selector: 'app-edit-centro',
  templateUrl: './edit-centro.component.html',
  styleUrls: ['./edit-centro.component.css']
})
export class EditCentroComponent implements OnInit {

  public id: string;
  editForm: FormGroup;
  public centroDetail: any;
  constructor(private formBuilder: FormBuilder, private router: Router, private svc: EditCentroService) { }

  public params =
    [
      {
        "name": "NOME_CENTRO",
        "alias": "Nome",
        "type": "string"
      },
      {
        "name": "NOME_CURTO",
        "alias": "Nome Curto",
        "type": "string"
      },
      {
        "name": "BAIRRO",
        "alias": "Bairro",
        "type": "string"
      },
      {
        "name": "CEP",
        "alias": "CEP",
        "type": "string"
      },
      {
        "name": "ENDERECO",
        "alias": "Endereço",
        "type": "string"
      },
      {
        "name": "CIDADE",
        "alias": "Cidade",
        "type": "string"
      },
      {
        "name": "ESTADO",
        "alias": "Estado",
        "type": "string"
      },
      {
        "name": "PAIS",
        "alias": "País",
        "type": "string"
      },
      {
        "name": "CNPJ_CENTRO",
        "alias": "CNPJ",
        "type": "string"
      },
      {
        "name": "DATA_FUNDACAO",
        "alias": "Fundação",
        "type": "string"
      }
    ]

  ngOnInit() {
    this.id = window.localStorage.getItem("centroID");

    this.editForm = this.formBuilder.group({
      ID_CENTRO: [''],
      COMPLEMENTO: [''],
      NOME_CENTRO: ['', Validators.required],
      NOME_CURTO: ['', Validators.required],
      BAIRRO: ['', Validators.required],
      CEP: ['', Validators.required],
      ENDERECO: ['', Validators.required],
      NUMERO_ENDERECO: [''],
      CIDADE: ['', Validators.required],
      ESTADO: ['', Validators.required],
      PAIS: ['', Validators.required],
      CNPJ_CENTRO: ['', Validators.required],
      DATA_FUNDACAO: ['', Validators.required],
      ID_PRESIDENTE: [''],
      ID_REGIONAL: ['']
    });
    this.svc.getCentro(this.id).then(data => {

      console.log(data[0])
      this.centroDetail = data[0];

      console.log(this.centroDetail)
      this.editForm.setValue(this.centroDetail);
    });
  }

  onSubmit() {
    this.svc.updateCentro(this.editForm.value).then(data => {
      // if (data.status === 200) {
      alert('User updated successfully.');
      this.router.navigate(['centro-detail']);
      // } else {
      //   alert(data.message);
      // }
    })
  }

}