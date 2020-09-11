import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from "rxjs/index";

@Injectable({
  providedIn: 'root'
})
export class EditCentroService {

  constructor(private http: HttpClient) { }

  getCentro(id: string) {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.centrosApi}/centros/${id}`)
        .subscribe((a) => {
          resolve(a);
        }, () => {
        })
    })
  }

  updateCentro(centro) {
    return new Promise((resolve, reject) => {
      let id = centro.ID_CENTRO
      this.http.put<any>(`${environment.centrosApi}/centros/${id}`, centro)
        .subscribe((a) => {
          resolve(a);
        }, () => {
        })
    })
  }

}