import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentroDetailPopupComponent } from './centro-detail-popup.component';

describe('CentroDetailPopupComponent', () => {
  let component: CentroDetailPopupComponent;
  let fixture: ComponentFixture<CentroDetailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentroDetailPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CentroDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
