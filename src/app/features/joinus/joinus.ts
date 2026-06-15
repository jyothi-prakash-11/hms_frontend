import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JoinusService } from './joinus.service';
import { RolesResponse } from '../auth/auth.model';
import { CreateApprovalRequest, DepartmentResponse } from './joinus.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-joinus',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './joinus.html',
  styleUrls: ['./joinus.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Joinus implements OnInit {
  showEmailForm = signal(true)
  showForm = signal(false);
  showSuccessCard = signal(false);
  statusMessage = signal('');
  selectedRole = '';
  isCheckingMail = signal(false);
  verificationMailSent = signal(false);
  today = new Date()
    .toISOString()
    .split('T')[0];
  roles: RolesResponse[] = [];
  departments = signal<DepartmentResponse[]>([]);//DepartmentResponse[] = [];
  emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  joinusForm = new FormGroup({

    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),

    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]),

    role: new FormControl('', [
      Validators.required
    ]),

    department: new FormControl('', [
      Validators.required
    ]),

    designation: new FormControl('', [
      Validators.required
    ]),

    joiningDate: new FormControl('', [
      Validators.required
    ]),

    specialization: new FormControl(''),

    qualification: new FormControl(''),

    consultationFee: new FormControl<number | null>(null),

    medicalRegistrationNo: new FormControl(''),

    experienceYears: new FormControl<number | null>(null)

  });


  constructor(private joinusService: JoinusService) { }

  ngOnInit(): void {
    this.joinusForm.get('role')?.valueChanges.subscribe((role) => {
      this.selectedRole = role || '';
      if (role === 'Doctor') {

        this.joinusForm
          .controls
          .specialization
          .addValidators([
            Validators.required
          ]);

        this.joinusForm
          .controls
          .qualification
          .addValidators([
            Validators.required
          ]);

        this.joinusForm
          .controls
          .consultationFee
          .addValidators([
            Validators.required,
            Validators.min(1)
          ]);

        this.joinusForm
          .controls
          .medicalRegistrationNo
          .addValidators([
            Validators.required
          ]);

        this.joinusForm
          .controls
          .experienceYears
          .addValidators([
            Validators.required,
            Validators.min(0)
          ]);

      } else {

        this.joinusForm
          .controls
          .specialization
          .clearValidators();

        this.joinusForm
          .controls
          .qualification
          .clearValidators();

        this.joinusForm
          .controls
          .consultationFee
          .clearValidators();

        this.joinusForm
          .controls
          .medicalRegistrationNo
          .clearValidators();

        this.joinusForm
          .controls
          .experienceYears
          .clearValidators();

      }

      this.joinusForm
        .controls
        .specialization
        .updateValueAndValidity();

      this.joinusForm
        .controls
        .qualification
        .updateValueAndValidity();

      this.joinusForm
        .controls
        .consultationFee
        .updateValueAndValidity();

      this.joinusForm
        .controls
        .medicalRegistrationNo
        .updateValueAndValidity();

      this.joinusForm
        .controls
        .experienceYears
        .updateValueAndValidity();
    });
    this.loadRoles();
    this.loadDepartments();
  }

  checkEmail(): void {
    console.log('sending req to get approval status ');
    const email = this.emailControl.value;
    this.isCheckingMail.set(true);
    this.joinusService.checkApprovalStatus(email)
      .subscribe({
        next: (res: any) => {
          const data = res.data;
          console.log('recived res from servre');
          if (!data.approvalExists) {
            this.showEmailForm.set(false);
            this.showForm.set(true);
            this.joinusForm.patchValue({ email });
            this.statusMessage.set('');
            this.isCheckingMail.set(false);
            return;
          }

          if (!data.verified) {
            this.showEmailForm.set(true);
            this.showForm.set(false);
            this.statusMessage.set('Verification email sent. Please verify your email.');
            this.isCheckingMail.set(false);
            return;
          }
          this.isCheckingMail.set(false);
          this.showEmailForm.set(true);
          this.showForm.set(false);
          this.statusMessage.set('Your request is already pending admin approval.');
        },
        error: (error) => {
          console.log("error ", error)
          this.statusMessage.set(error.error.message);
          this.isCheckingMail.set(false);
        },
      });
    console.log('checked mail');
  }
  loadRoles() {
    this.joinusService.getRoles().subscribe(
      {
        next: (rolesResponse) => {
          this.roles = rolesResponse.data.map(rolename => rolename);
          console.log("roles :", this.roles);
        }
      }
    );
  }
  loadDepartments() {
    this.joinusService.getDepartments().subscribe({
      next: (departmentsResponse) => {
        const departments = departmentsResponse.data
        this.departments.set(departments);
        console.log('fetched departments : ', this.departments());
      }
    })
  }
  onSubmit(): void {
    if (this.joinusForm.invalid) {
      this.joinusForm.markAllAsTouched();
      return;
    }
    const formValue = this.joinusForm.getRawValue();
    const payload: CreateApprovalRequest = {
      firstname:
        formValue.firstName!,
      lastname:
        formValue.lastName!,
      email:
        formValue.email!,
      phone:
        formValue.phone!,
      password:
        formValue.password!,
      roleCode:
        formValue.role!,
      department:
        formValue.department!,
      designation:
        formValue.designation!,
      joiningDate:
        formValue.joiningDate!,
      specialization:
        formValue.specialization || undefined,
      qualification:
        formValue.qualification || undefined,
      consultationFee:
        formValue.consultationFee
          ? Number(
            formValue.consultationFee
          )
          : undefined,
      medicalRegistrationNo:
        formValue.medicalRegistrationNo || undefined,
      experienceYears:
        formValue.experienceYears
          ? Number(
            formValue.experienceYears
          )
          : undefined
    }
    this.joinusService.createApproval(payload).subscribe(
      {
        next: (response) => {
          console.log('Response ', response);
          this.verificationMailSent.set(true);
          this.joinusForm
            .reset();
          this.emailControl
            .reset();
          this.showForm.set(false);
          this.verificationMailSent.set(true);
        }
      }
    );
  }
}
