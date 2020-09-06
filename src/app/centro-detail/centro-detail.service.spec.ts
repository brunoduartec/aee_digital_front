import { TestBed } from '@angular/core/testing';

import { CentroDetailService } from './centro-detail.service';

describe('CentroDetailService', () => {
  let service: CentroDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentroDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
