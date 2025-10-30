import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAgendaComponent } from './add-edit-agenda.component';

describe('AddEditAgendaComponent', () => {
  let component: AddEditAgendaComponent;
  let fixture: ComponentFixture<AddEditAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditAgendaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
