import { Component, OnInit } from '@angular/core';
import { CentroServiceService } from "./centro-service.service";

@Component({
  selector: 'app-centro-list',
  templateUrl: './centro-list.component.html',
  styleUrls: ['./centro-list.component.css']
})
export class CentroListComponent implements OnInit {
  public centroData: any;

  constructor(private svc: CentroServiceService) { }

  ngOnInit(): void {
    this.svc.getAllCentros().then(data => {
      this.centroData = data;
    });
  }

}
