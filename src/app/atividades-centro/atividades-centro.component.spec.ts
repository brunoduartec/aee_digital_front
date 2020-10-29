import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtividadesCentroComponent } from './atividades-centro.component';

describe('AtividadesCentroComponent', () => {
  let component: AtividadesCentroComponent;
  let fixture: ComponentFixture<AtividadesCentroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtividadesCentroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtividadesCentroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
