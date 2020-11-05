import { TestBed } from '@angular/core/testing';

import { AtividadesCentroService } from './atividades-centro.service';

describe('AtividadesCentroService', () => {
  let service: AtividadesCentroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtividadesCentroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
