import { Pipe, PipeTransform } from '@angular/core';
import { RegionaisEnum } from '../regionais.enum';

@Pipe({
  name: 'RegionaisPipe'
})
export class RegionaisPipe implements PipeTransform {

  transform(id_regional: number): string {
      return RegionaisEnum[id_regional];
  }
}

     
