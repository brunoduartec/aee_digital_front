import { TestBed } from '@angular/core/testing';

import { CentroServiceService } from './centro-service.service';

describe('CentroServiceService', () => {
  let service: CentroServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentroServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
