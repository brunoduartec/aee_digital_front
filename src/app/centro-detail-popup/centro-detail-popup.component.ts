import { OnInit } from '@angular/core';

import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CentroDetailComponent } from '../centro-detail/centro-detail.component';

@Component({
  selector: 'app-centro-detail-popup',
  templateUrl: './centro-detail-popup.component.html',
  styleUrls: ['./centro-detail-popup.component.css']
})
export class CentroDetailPopupComponent {
  public centroId: string = "1";

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.centroId = data.id
    console.log("=========CENTROID=====: ", this.centroId)
  }

}
