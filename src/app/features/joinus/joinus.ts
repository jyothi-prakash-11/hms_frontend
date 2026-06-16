import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JoinusService } from './joinus.service';
import { RolesResponse } from '../auth/auth.model';
import { CreateApprovalRequest, DepartmentResponse } from './joinus.model';
import { finalize } from 'rxjs';
import { UserForm } from '../../shared/components/user-form/user-form';
import { EmployeeForm } from '../../shared/components/employee-form/employee-form';
import { DoctorForm } from '../../shared/components/doctor-form/doctor-form';

@Component({
  selector: 'app-joinus',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UserForm, EmployeeForm, DoctorForm],
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
    userInfo: new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
      roleName: new FormControl('', [Validators.required])
    }),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    employeeInfo: new FormGroup({
      department: new FormControl('', [Validators.required]),
      designation: new FormControl('', [Validators.required]),
      joiningDate: new FormControl('', [Validators.required])
    }),
    doctorInfo: new FormGroup({
      specialization: new FormControl(''),
      qualification: new FormControl(''),
      consultationFee: new FormControl<number | null>(null),
      medicalRegistrationNo: new FormControl(''),
      experienceYears: new FormControl<number | null>(null)
    })
  });


  constructor(private joinusService: JoinusService) { }

  private get doctorInfo() {
    return this.joinusForm.controls.doctorInfo;
  }

  ngOnInit(): void {
    this.joinusForm.get('userInfo.roleName')?.valueChanges.subscribe((role) => {
      this.selectedRole = role || '';
      if (role === 'Doctor') {
        this.doctorInfo.controls.specialization.addValidators([Validators.required]);
        this.doctorInfo.controls.qualification.addValidators([Validators.required]);
        this.doctorInfo.controls.consultationFee.addValidators([Validators.required, Validators.min(1)]);
        this.doctorInfo.controls.medicalRegistrationNo.addValidators([Validators.required]);
        this.doctorInfo.controls.experienceYears.addValidators([Validators.required, Validators.min(0)]);
      } else {
        this.doctorInfo.controls.specialization.clearValidators();
        this.doctorInfo.controls.qualification.clearValidators();
        this.doctorInfo.controls.consultationFee.clearValidators();
        this.doctorInfo.controls.medicalRegistrationNo.clearValidators();
        this.doctorInfo.controls.experienceYears.clearValidators();
      }

      this.doctorInfo.controls.specialization.updateValueAndValidity();
      this.doctorInfo.controls.qualification.updateValueAndValidity();
      this.doctorInfo.controls.consultationFee.updateValueAndValidity();
      this.doctorInfo.controls.medicalRegistrationNo.updateValueAndValidity();
      this.doctorInfo.controls.experienceYears.updateValueAndValidity();
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
            this.joinusForm.patchValue({ userInfo: { email } });
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
      firstname: formValue.userInfo.firstName!,
      lastname: formValue.userInfo.lastName!,
      email: formValue.userInfo.email!,
      phone: formValue.userInfo.phone!,
      password: formValue.password!,
      roleCode: formValue.userInfo.roleName!,
      department: formValue.employeeInfo.department!,
      designation: formValue.employeeInfo.designation!,
      joiningDate: formValue.employeeInfo.joiningDate!,
      specialization: formValue.doctorInfo.specialization || undefined,
      qualification: formValue.doctorInfo.qualification || undefined,
      consultationFee: formValue.doctorInfo.consultationFee ?? undefined,
      medicalRegistrationNo: formValue.doctorInfo.medicalRegistrationNo || undefined,
      experienceYears: formValue.doctorInfo.experienceYears ?? undefined
    }
    this.joinusService.createApproval(payload).subscribe(
      {
        next: (response) => {
          console.log('Response ', response);
          this.verificationMailSent.set(true);
          this.joinusForm.reset({
            userInfo: { roleName: '' },
            password: '',
            employeeInfo: {},
            doctorInfo: {}
          });
          this.emailControl.reset();
          this.showForm.set(false);
          this.verificationMailSent.set(true);
        }
      }
    );
  }
}
