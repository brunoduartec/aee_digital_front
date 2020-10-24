import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-cadastro-centro',
  templateUrl: './cadastro-centro.component.html',
  styleUrls: ['./cadastro-centro.component.css']
})
export class CadastroCentroComponent implements OnInit {

  checkoutForm;
  constructor(private formBuilder: FormBuilder) {
    this.checkoutForm = this.formBuilder.group({
      nomeCentro: '',
      endereco: '',
      bairro: '',
      cidade:'',
      estado:'',
      pais:'',
    });
   }

  ngOnInit(): void {
  }

  onSubmit(customerData) {
    console.log(customerData);
    this.checkoutForm.reset();
  }

}
