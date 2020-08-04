import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionaisComponent } from './regionais.component';

describe('RegionaisComponent', () => {
  let component: RegionaisComponent;
  let fixture: ComponentFixture<RegionaisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegionaisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
