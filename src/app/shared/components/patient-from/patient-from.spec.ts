import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFrom } from './patient-from';

describe('PatientFrom', () => {
  let component: PatientFrom;
  let fixture: ComponentFixture<PatientFrom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientFrom],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFrom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
