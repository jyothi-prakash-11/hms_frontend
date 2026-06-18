import { Component, OnInit, inject, signal } from '@angular/core';
import { CreateDoctorRequest, DoctorListItem, FullDoctorDetail } from './doctor.model';
import { DoctorService } from './doctor.service';
import { debounceTime, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserForm } from '../../shared/components/user-form/user-form';
import { EmployeeForm } from '../../shared/components/employee-form/employee-form';
import { DoctorForm } from '../../shared/components/doctor-form/doctor-form';
import ToastService from '../../shared/components/toast/toast.service';
import { RolesResponse } from '../auth/auth.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserForm, EmployeeForm, DoctorForm],
  templateUrl: './doctor.html',
  styleUrls: ['./doctor.css'],
})
export class Doctor implements OnInit {
  // Directory state arrays
  doctors = signal<DoctorListItem[]>([]);
  expandedDoctorCode = signal<string | null>(null);

  // Handled Logic in TS: Single active details object and sub-loader tracking signals
  activeDoctorDetail = signal<FullDoctorDetail | null>(null);
  isDetailLoading = signal<boolean>(false);

  // Pagination states
  isLoading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalRecords = signal<number>(0);
  itemsPerPage = 10;

  // Modal toggle switches
  showDoctorEmailForm = signal<boolean>(false);
  showDoctorModal = signal<boolean>(false);
  isCheckingDoctor = signal<boolean>(false);
  isCreatingDoctor = signal<boolean>(false);
  doctorStatusMessage = signal<string | null>(null);

  // Interactive Form fields
  searchControl = new FormControl('');
  emailControl = new FormControl('', [Validators.required, Validators.email]);

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
    this.loadDoctors(1, '');

    this.searchControl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading.set(true);
        this.currentPage.set(1);
      }),
      switchMap(query => this.doctorService.getDoctors(1, this.itemsPerPage, query || ''))
    ).subscribe({
      next: (res) => {
        this.doctors.set(res.data.doctors || []);
        this.totalPages.set(res.data.pagination.totalPages || 1);
        this.totalRecords.set(res.data.pagination.total || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Directory index searching failure.');
        this.isLoading.set(false);
      }
    });
  }

  loadDoctors(page: number, search: string) {
    this.isLoading.set(true);
    this.doctorService.getDoctors(page, this.itemsPerPage, search).subscribe({
      next: (res) => {
        this.doctors.set(res.data.doctors || []);
        this.totalPages.set(res.data.pagination.totalPages || 1);
        this.totalRecords.set(res.data.pagination.total || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to parse database registries.');
        this.isLoading.set(false);
      }
    });
  }

  // Pure Employee Code-driven Toggle UI Control Router
  toggleDoctor(employeeCode: string) {
    if (this.expandedDoctorCode() === employeeCode) {
      this.expandedDoctorCode.set(null);
      this.activeDoctorDetail.set(null);
      return;
    }

    this.expandedDoctorCode.set(employeeCode);
    this.activeDoctorDetail.set(null); // Wipe outdated reference context clean
    this.isDetailLoading.set(true);

    this.doctorService.getDoctorByCode(employeeCode).subscribe({
      next: (res) => {
        this.activeDoctorDetail.set(res.data);
        this.isDetailLoading.set(false);
      },
      error: (err) => {
        console.error('API processing exception:', err);
        this.toastService.error('Unable to fetch detailed registration records.');
        this.expandedDoctorCode.set(null);
        this.isDetailLoading.set(false);
      }
    });
  }

  goToPage(direction: number): void {
    const targetPage = this.currentPage() + direction;
    if (targetPage < 1 || targetPage > this.totalPages()) return;

    this.currentPage.set(targetPage);
    this.loadDoctors(targetPage, this.searchControl.value || '');
  }

  canEdit() { return this.doctorService.canEditDoctor(); }
  canAdd() { return this.doctorService.canAddDoctor(); }

  openAddDoctor() {
    this.showDoctorEmailForm.set(true);
    this.showDoctorModal.set(false);
  }

  checkDoctor() {
    const email = this.emailControl.getRawValue();
    this.doctorStatusMessage.set(null);
    this.isCheckingDoctor.set(true);

    this.doctorService.checkDoctorExists(email!)
      .pipe(finalize(() => this.isCheckingDoctor.set(false)))
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
      userInfo: { roleName: 'Doctor' },
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
          setTimeout(() => this.doctorStatusMessage.set(''), 5000);
        })
      )
      .subscribe({
        next: () => {
          this.loadDoctors(this.currentPage(), this.searchControl.value || '');
          this.toastService.success('Doctor has been created successfully');
          this.closeDoctorModal();
        },
        error: (error) => {
          this.toastService.error(error.error?.message ?? 'Something went wrong');
        }
      });
  }
  editDoctor(id:string){
    
  }
}