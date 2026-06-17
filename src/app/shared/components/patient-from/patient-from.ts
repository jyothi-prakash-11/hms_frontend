import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-from',
  imports: [ReactiveFormsModule],
  templateUrl: './patient-from.html',
  styleUrl: './patient-from.css',
})
export class PatientFrom {
  form = input.required<FormGroup>();
}
