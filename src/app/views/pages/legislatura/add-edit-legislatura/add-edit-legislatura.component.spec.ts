import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLegislaturaComponent } from './add-edit-legislatura.component';

describe('AddEditLegislaturaComponent', () => {
  let component: AddEditLegislaturaComponent;
  let fixture: ComponentFixture<AddEditLegislaturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditLegislaturaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditLegislaturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
