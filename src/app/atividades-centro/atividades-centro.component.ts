import { Component, OnInit, Input } from '@angular/core';
import { AtividadesCentroService } from './atividades-centro.service';

@Component({
  selector: 'app-atividades-centro',
  templateUrl: './atividades-centro.component.html',
  styleUrls: ['./atividades-centro.component.css']
})
export class AtividadesCentroComponent implements OnInit {

  public atividadeCentroData: any;

  constructor(private svc: AtividadesCentroService) { }

  @Input()
  set id(id: string) {
    this.svc.getAtividadesCentro(id).then(data => {
      this.atividadeCentroData = data;
    });
  }

  ngOnInit(): void {
  }

}
