import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { RegionaisEnum } from 'src/app/util/regionais.enum';

@Injectable({
  providedIn: 'root'
})
export class CentroServiceService {
  constructor(private http: HttpClient) { }

  getAllCentros(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.centrosApi}/centros`)
        .subscribe((a) => {
          a.forEach(centro => {
            centro.REGIONAL = RegionaisEnum[centro.ID_REGIONAL]
          });
          resolve(a);
        }, () => {
        })
    })
  }

  getCentro(searchValue: string, searchParam: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.centrosApi}/centros?searchParam=${searchParam}&searchValue=${searchValue}`)
        .subscribe((a) => {

          console.log("--------REGIONAL----");
          console.log(a)

          resolve(a);
        }, () => {
        })
    })
  }
}
