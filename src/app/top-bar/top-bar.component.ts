import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  logo_header = `src/assets/img/logo_header.png`;
  constructor() { }

  ngOnInit(): void {
  }

}
