import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from "rxjs/Observable";

@Injectable({
  providedIn: 'root'
})
export class RegionaisServiceService {

  constructor(private http: HttpClient) { }

  getAllRegionais(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.centrosApi}/regionais`)
        .subscribe((a) => {
          resolve(a);
        }, () => {
        })
    })
  }

  getRegionalPorId(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.centrosApi}/regionais?searchParam=NOME_CENTRO&searchValue=${id}`)
        .subscribe((a) => {
          resolve(a);
        }, () => {
        })
    })
  }
}
