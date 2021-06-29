import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { RegionaisEnum } from 'src/app/util/regionais.enum';

@Injectable({
  providedIn: 'root',
})
export class CentroServiceService {
  constructor(private http: HttpClient) {}

  getRegional(id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get<any>(`${environment.centrosApi}/regionais?_id=${id}`)
        .subscribe(
          (a) => {
            resolve(a);
          },
          () => {}
        );
    });
  }
  getAllCentros(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.centrosApi}/centros`).subscribe(
        (a) => {
          a.forEach((centro) => {
            this.getRegional(centro.REGIONAL_ID).then((b) => {
              centro.Regional = b[0]['NOME_REGIONAL'];
              console.log(centro);
            });
          });

          resolve(a);
        },
        () => {}
      );
    });
  }

  getCentro(searchValue: string, searchParam: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get<any>(
          `${environment.centrosApi}/centros?${searchParam}=${searchValue}`
        )
        .subscribe(
          (a) => {
            console.log('--------REGIONAL----');
            console.log(a);

            resolve(a);
          },
          () => {}
        );
    });
  }
}
