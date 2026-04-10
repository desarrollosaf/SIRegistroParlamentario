import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotacionIniciativaComponent } from './votacion-iniciativa.component';

describe('VotacionIniciativaComponent', () => {
  let component: VotacionIniciativaComponent;
  let fixture: ComponentFixture<VotacionIniciativaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotacionIniciativaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotacionIniciativaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
