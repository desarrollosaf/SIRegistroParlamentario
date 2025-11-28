import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegislaturaComponent } from './legislatura.component';

describe('LegislaturaComponent', () => {
  let component: LegislaturaComponent;
  let fixture: ComponentFixture<LegislaturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegislaturaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegislaturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
