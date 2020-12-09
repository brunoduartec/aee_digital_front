import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentroReviewComponent } from './centro-review.component';

describe('CentroReviewComponent', () => {
  let component: CentroReviewComponent;
  let fixture: ComponentFixture<CentroReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentroReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CentroReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
