import { Component, OnInit } from '@angular/core';
import { RegionaisServiceService } from "./regionais-service.service";
import { TipoConsultaCentro } from '../util/consulta-centros.enum';

@Component({
  selector: 'app-regionais',
  templateUrl: './regionais.component.html',
  styleUrls: ['./regionais.component.css']
})
export class RegionaisComponent implements OnInit {
  public regionalData: any;
  tipo: { key: number, value: string };
  tipoPesquisa: { key: number, value: string }[] = [];
  argumentoPesquisa: string;
  campo: string;
  dadosCarregados = false;

  public params =
    [
      {
        "name": "NOME_REGIONAL",
        "alias": "Nome"
      },
      {
        "name": "ESTADO",
        "alias": "Estado"
      },
      {
        "name": "PAIS",
        "alias": "País"
      }
    ];


  constructor(private svc: RegionaisServiceService) {
    this.campo = "Campo";

    for (const tipo in TipoConsultaCentro) {
      if (typeof TipoConsultaCentro[tipo] === 'number') {
        this.tipoPesquisa.push({ key: Number(TipoConsultaCentro[tipo]), value: tipo });
      }
    }
    this.tipo = this.tipoPesquisa[0];
  }

  ngOnInit(): void {
    this.svc.getAllRegionais().then(data => {
      this.regionalData = data;
    });
  }

  pesquisar() {
    this.svc.getRegionalPorId(this.argumentoPesquisa)
      .then((resultado: any) => {
        if (resultado) {
          this.regionalData = resultado;
          this.dadosCarregados = true;
        }
      });
  }

}
