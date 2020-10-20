import { Component, OnInit, Inject } from '@angular/core';
import { AtividadesService } from "./atividades.service";

@Component({
  selector: 'app-atividades',
  templateUrl: './atividades.component.html',
  styleUrls: ['./atividades.component.css']
})
export class AtividadesComponent implements OnInit {
  public id: string;

  public atividadesData: any;

  public params =
    [
      {
        "name": "NOME_ATIVIDADE",
        "alias": "Nome"
      }
    ]

  constructor(private svc: AtividadesService) { }

  ngOnInit(): void {
    this.svc.getAtividades(this.id).then(atividade_info => {
      this.atividadesData = atividade_info;
      console.log(this.atividadesData);
    })
  }

}
