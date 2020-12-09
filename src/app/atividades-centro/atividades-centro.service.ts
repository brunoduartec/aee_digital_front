import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from "rxjs/Observable";

@Injectable({
  providedIn: 'root'
})
export class AtividadesCentroService {

  constructor(private http: HttpClient) { }

  getAtividadeInfo(id: string) {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.trabalhosApi}/atividades/${id}`)
        .subscribe((a) => {
          resolve(a);
        }, () => {
        })
    })
  }

  getAtividadesCentro(id: string) {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.trabalhosApi}/atividades_centro?searchParam=2&searchValue=${id}`)
        .subscribe((a) => {

          a.forEach(atividade => {
            this.getAtividadeInfo(atividade.ID_ATIVIDADE)
              .then((b) => {
                atividade.NOME_ATIVIDADE = b[0]["NOME_ATIVIDADE"];
              })
          });
          resolve(a);
        }, () => {
        })
    })
  }

  updateAtividadeCentro(atividadeCentro) {
    return new Promise((resolve, reject) => {

      let id = atividadeCentro.ID_ATIVIDADE_CENTRO
      let atividadeCentroInfo = JSON.parse(JSON.stringify(atividadeCentro))

      delete atividadeCentroInfo.ID_ATIVIDADE_CENTRO
      delete atividadeCentroInfo.NOME_ATIVIDADE

      this.http.put<any>(`${environment.trabalhosApi}/atividades_centro/${id}`, atividadeCentroInfo)
        .subscribe((a) => {

          resolve(a);
        }, () => {
        })
    })
  }


}
