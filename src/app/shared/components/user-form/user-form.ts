import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RolesResponse } from '../../../features/auth/auth.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.css'],
})
export class UserForm {
  form = input.required<FormGroup>();
  roles = input.required<RolesResponse[]>();
}
