import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IniciativasDecretosComponent } from './iniciativas-decretos.component';

describe('IniciativasDecretosComponent', () => {
  let component: IniciativasDecretosComponent;
  let fixture: ComponentFixture<IniciativasDecretosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciativasDecretosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IniciativasDecretosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
