import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root',
})
export class AtividadesCentroService {
  constructor(private http: HttpClient) {}

  getAtividadeInfo(id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get<any>(`${environment.trabalhosApi}/atividades?_id=${id}`)
        .subscribe(
          (a) => {
            resolve(a);
          },
          () => {}
        );
    });
  }

  getAtividadesCentro(id: string) {
    console.log('---ACTIVITY_ID', id);
    return new Promise((resolve, reject) => {
      this.http
        .get<any>(
          `${environment.trabalhosApi}/atividades_centro?CENTRO_ID=${id}`
        )
        .subscribe(
          (a) => {
            a.forEach((atividade) => {
              this.getAtividadeInfo(atividade.ATIVIDADE_ID).then((b) => {
                atividade.NOME_ATIVIDADE = b[0]['NOME_ATIVIDADE'];
              });
            });
            resolve(a);
          },
          () => {}
        );
    });
  }

  updateAtividadeCentro(atividadeCentro) {
    return new Promise((resolve, reject) => {
      console.log('ATIVIDADE CENTRO', atividadeCentro);
      let id = atividadeCentro.ID;
      let atividadeCentroInfo = JSON.parse(JSON.stringify(atividadeCentro));

      delete atividadeCentroInfo.ID;
      delete atividadeCentroInfo.NOME_ATIVIDADE;

      this.http
        .put<any>(
          `${environment.trabalhosApi}/atividades_centro?_id=${id}`,
          atividadeCentroInfo
        )
        .subscribe(
          (a) => {
            resolve(a);
          },
          () => {}
        );
    });
  }
}
