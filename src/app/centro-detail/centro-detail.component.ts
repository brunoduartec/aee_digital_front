import { Component, Inject, forwardRef, Input } from '@angular/core';
import { CentroDetailService } from './centro-detail.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CentroDetailComponent),
  multi: true,
};

@Component({
  selector: 'centro-detail',
  templateUrl: './centro-detail.component.html',
  styleUrls: ['./centro-detail.component.css'],
})
export class CentroDetailComponent implements ControlValueAccessor {
  public centroDetail: any;
  public date: Date = new Date(2013, 9, 22);
  public _id: string = '1';

  @Input()
  set id(id: any) {
    this._id = id;
    this.svc.getCentro(this._id).then((data) => {
      this.centroDetail = data[0];
    });
  }

  get id(): any {
    return this._id;
  }

  public onChange: any = Function.prototype;
  public onTouched: any = Function.prototype;

  public params = [
    {
      name: 'NOME_CENTRO',
      alias: 'Nome',
    },
    {
      name: 'NOME_CURTO',
      alias: 'Nome Curto',
    },
    {
      name: 'BAIRRO',
      alias: 'Bairro',
    },
    {
      name: 'CEP',
      alias: 'CEP',
    },
    {
      name: 'ENDERECO',
      alias: 'Endereço',
    },
    {
      name: 'CIDADE',
      alias: 'Cidade',
    },
    {
      name: 'ESTADO',
      alias: 'Estado',
    },
    {
      name: 'PAIS',
      alias: 'País',
    },
    {
      name: 'CNPJ_CENTRO',
      alias: 'CNPJ',
    },
    {
      name: 'DATA_FUNDACAO',
      alias: 'Fundação',
    },
    {
      name: 'ID',
      alias: 'id',
      hidden: true,
    },
  ];

  constructor(private svc: CentroDetailService) {}

  atualizar() {
    this.svc.updateCentro(this.centroDetail).then((data) => {
      console.log('Atualizou', this.centroDetail.NOME_CENTRO);
      console.log(this.centroDetail);
    });
  }

  writeValue(value: any) {}

  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }
}
