import { Component, OnInit, inject, signal } from '@angular/core';
import { CreateDoctorRequest, DoctorResponse } from './doctor.model';
import { DoctorService } from './doctor.service';
import { finalize } from 'rxjs';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserForm } from '../../shared/components/user-form/user-form';
import { EmployeeForm } from '../../shared/components/employee-form/employee-form';
import { DoctorForm } from '../../shared/components/doctor-form/doctor-form';
import ToastService from '../../shared/components/toast/toast.service';
import { RolesResponse } from '../auth/auth.model';

@Component({
  selector: 'app-doctor',
  imports: [ReactiveFormsModule, UserForm, EmployeeForm, DoctorForm],
  templateUrl: './doctor.html',
  styleUrls: ['./doctor.css'],
})
export class Doctor implements OnInit {
  //data 
  doctors = signal<DoctorResponse[]>([]);
  expandedDoctorEmail = signal<string | null>(null);
  //status flags
  showDoctorEmailForm = signal<boolean>(false);
  showDoctorModal = signal<boolean>(false);
  isCheckingDoctor = signal<boolean>(false);
  isCreatingDoctor = signal<boolean>(false);
  // message placeholders
  doctorStatusMessage = signal<string | null>(null);
  //form controls
  //email form control
  emailControl = new FormControl('',
    [
      Validators.required,
      Validators.email
    ]
  );
  doctorRoles = signal<RolesResponse[]>([{ name: 'Doctor' }]);
  private fb = inject(NonNullableFormBuilder);
  doctorForm = this.fb.group({
    userInfo: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      roleName: ['Doctor', Validators.required]
    }),
    employeeInfo: this.fb.group({
      department: ['' as 'OPD' | 'IPD' | 'LAB' | 'PHARMACY' | 'ADMIN', Validators.required],
      designation: ['', Validators.required],
      joiningDate: ['', Validators.required]
    }),
    doctorInfo: this.fb.group({
      specialization: ['', Validators.required],
      qualification: ['', Validators.required],
      consultationFee: [0, [Validators.required, Validators.min(0)]],
      medicalRegistrationNo: ['', Validators.required],
      experienceYears: [0, [Validators.required, Validators.min(0)]],
      availabilityStartTime: [''],
      availabilityEndTime: ['']
    })
  });
  constructor(private doctorService: DoctorService, private toastService: ToastService) { }
  ngOnInit(): void {
    this.loadDoctors();
  }
  loadDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (res) => {
        console.log(res);
        this.doctors.set(res.data);
        console.log(this.doctors());
      }
    });
  }
  toggleDoctor(email: string) {
    if (this.expandedDoctorEmail() === email) {
      this.expandedDoctorEmail.set(null);
      return;
    }
    this.expandedDoctorEmail.set(email);
  }
  canEdit() {
    return this.doctorService.canEditDoctor();
  }
  canAdd() {
    return this.doctorService.canAddDoctor();
  }
  openAddDoctor() {
    this.showDoctorEmailForm.set(true);
    this.showDoctorModal.set(false);
  }
  checkDoctor() {
    const email = this.emailControl.getRawValue();

    this.doctorStatusMessage.set(null);
    this.isCheckingDoctor.set(true);

    this.doctorService.checkDoctorExists(email!)
      .pipe(
        finalize(() => this.isCheckingDoctor.set(false))
      )
      .subscribe({
        next: (res) => {
          if (res.data.exist) {
            this.doctorStatusMessage.set('Account already exists with email');
          } else {
            this.doctorForm.patchValue({ userInfo: { email: email ?? '' } });
            this.doctorForm.controls.userInfo.controls.email.disable();
            this.showDoctorEmailForm.set(false);
            this.showDoctorModal.set(true);
          }
        },
        error: () => {
          this.doctorStatusMessage.set('Something went wrong');
        }
      });
  }
  closeDoctorModal() {
    this.showDoctorModal.set(false);
    this.showDoctorEmailForm.set(false);
    this.doctorForm.controls.userInfo.controls.email.enable();
    this.doctorForm.reset({
      userInfo: {
        roleName: 'Doctor'
      },
      employeeInfo: {},
      doctorInfo: {}
    });
    this.emailControl.reset();
  }
  createDoctor() {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      this.toastService.error('Please fill in all required fields correctly.');
      return;
    }
    const rawValue = this.doctorForm.getRawValue();
    const { roleName, ...userInfo } = rawValue.userInfo;
    const payload: CreateDoctorRequest = {
      ...userInfo,
      ...rawValue.employeeInfo,
      ...rawValue.doctorInfo
    };
    this.isCreatingDoctor.set(true);
    this.doctorService.createDoctor(payload)
      .pipe(
        finalize(() => {
          this.isCreatingDoctor.set(false);
          setTimeout(() => {
            this.doctorStatusMessage.set('');
          }, 5000);
        })
      )
      .subscribe({
        next: (res) => {
          this.doctors.update(
            doctors => [
              res.data,
              ...doctors
            ]
          );
          this.toastService.success('Doctor has been created successfully');
          this.closeDoctorModal();
        },
        error: (error) => {
          this.toastService.error(error.error?.message ?? 'Something went wrong');
        }
      });
  }
}
