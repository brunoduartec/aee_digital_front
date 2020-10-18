import { Component, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  @Input() label: string = "Enter value here";
  @Input() required: boolean = true;
  private _value: string = '';
  private _type: string = "text";

  private preValue: string = '';
  public editing: boolean = false;
  public onChange: any = Function.prototype;
  public onTouched: any = Function.prototype;

  get value(): any {
    return this._value;
  }

  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
  }

  writeValue(value: any) {
    this._value = value;
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
}
