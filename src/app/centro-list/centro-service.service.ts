import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from "rxjs/Observable";

@Injectable({
  providedIn: 'root'
})
export class CentroServiceService {
  constructor(
    private http: HttpClient) { }

  getAllCentros(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.centrosApi}/centros`)
        .subscribe((a) => {
          resolve(a);
        }, () => {
        })
    })      
  }
}
