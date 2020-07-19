import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";

@Injectable({
  providedIn: 'root'
})
export class CentroServiceService {
  constructor(private http: HttpClient) { }

  getAllCentros(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>('http://localhost:3000/api/centro/')
        .subscribe((a) => {
          resolve(a);
        }, () => {

        })
    })


  }

}
