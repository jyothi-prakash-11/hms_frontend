import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './doctor-form.html',
  styleUrls: ['./doctor-form.css'],
})
export class DoctorForm {
  form = input.required<FormGroup>();
}
