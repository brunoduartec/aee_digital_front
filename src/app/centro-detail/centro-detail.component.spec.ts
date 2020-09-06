import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentroDetailComponent } from './centro-detail.component';

describe('CentroDetailComponent', () => {
  let component: CentroDetailComponent;
  let fixture: ComponentFixture<CentroDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentroDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CentroDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
