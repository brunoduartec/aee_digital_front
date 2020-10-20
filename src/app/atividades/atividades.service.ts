import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from "rxjs/Observable";

@Injectable({
  providedIn: 'root'
})
export class AtividadesService {
  constructor(private http: HttpClient) { }

  getAtividades(id: string) {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.trabalhosApi}/atividades`)
        .subscribe((a) => {
          resolve(a);
        }, () => {
        })
    })
  }
}
