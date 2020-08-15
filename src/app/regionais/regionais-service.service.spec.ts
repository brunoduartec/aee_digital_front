import { TestBed } from '@angular/core/testing';

import { RegionaisServiceService } from './regionais-service.service';

describe('RegionaisServiceService', () => {
  let service: RegionaisServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegionaisServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
