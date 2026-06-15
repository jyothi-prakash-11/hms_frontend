import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAppointmentForm } from './add-appointment-form';

describe('AddAppointmentForm', () => {
  let component: AddAppointmentForm;
  let fixture: ComponentFixture<AddAppointmentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAppointmentForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAppointmentForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
