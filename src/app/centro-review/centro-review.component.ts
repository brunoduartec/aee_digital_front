import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-centro-review',
  templateUrl: './centro-review.component.html',
  styleUrls: ['./centro-review.component.css']
})
export class CentroReviewComponent implements OnInit {
  centroId: any;

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const par = this.activatedRoute.snapshot.paramMap.get('ID_CENTRO');
    console.log(par);
    this.centroId = par;
  }

}
