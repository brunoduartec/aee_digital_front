import { TestBed } from '@angular/core/testing';

import { EditCentroService } from './edit-centro.service';

describe('EditCentroService', () => {
  let service: EditCentroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditCentroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
