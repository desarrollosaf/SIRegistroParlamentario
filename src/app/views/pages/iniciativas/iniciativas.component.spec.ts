import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IniciativasComponent } from './iniciativas.component';

describe('IniciativasComponent', () => {
  let component: IniciativasComponent;
  let fixture: ComponentFixture<IniciativasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciativasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IniciativasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
