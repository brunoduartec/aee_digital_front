import { Component, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';


const VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EditInlineComponent),
  multi: true
};

@Component({
  selector: 'app-edit-inline',
  templateUrl: './edit-inline.component.html',
  providers: [VALUE_ACCESSOR],
  styleUrls: ['./edit-inline.component.scss']
})
export class EditInlineComponent implements ControlValueAccessor {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'pen',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/pen.svg'));
  }
  @Input() label: string = "Enter value here";
  @Input() required: boolean = true;
  private _value: string = '';
  private _type: string = "text";
  private _valueFormated: string = '';

  private preValue: string = '';
  public editing: boolean = false;
  public onChange: any = Function.prototype;
  public onTouched: any = Function.prototype;


  get value(): any {
    return this._value;
  }

  get valueFormated(): any {
    return this._valueFormated;
  }

  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
  }

  @Input()
  set type(type: any) {
    this._type = type;


  }

  get type(): any {
    return this._type;
  }

  writeValue(value: any) {
    this._value = value;
    this._valueFormated = this._value;

    if (this._type == "date") {
      let valueStriped = String(this._valueFormated).split("-");
      this._valueFormated = `${valueStriped[2]}/${valueStriped[1]}/${valueStriped[0]}`
    }

  }

  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  onBlur($event: Event) {
    this.editing = false;

    if (this._value == "") {
      this._value = "No value available";
    }
  }

  beginEdit(value) {
    this.preValue = value;
    this.editing = true;
  }


  // public atualizar() {
  //   console.log("======UPDATE=====")
  // }
}
