import { Component, OnInit, signal, computed, effect, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from './patient.service';
import { CreatePatientRequest, PatientDetails, PatientSummary } from './patient.model';
import { UserForm } from '../../shared/components/user-form/user-form';
import { PatientFrom } from '../../shared/components/patient-from/patient-from';
import { RolesResponse } from '../auth/auth.model';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, UserForm, PatientFrom],
  templateUrl: './patient.html',
  styleUrls: ['./patient.css'],
})
export class Patient implements OnInit {
  // Core State Trackers (Signals)
  patients = signal<PatientSummary[]>([]);
  selectedPatient = signal<PatientDetails | null>(null);
  expandedPatientId = signal<string | null>(null);
  activeMenuPatientId = signal<string | null>(null);
  showPatientForm = signal(false);
  showEmailCheckingForm = signal(false);
  roles = signal<RolesResponse[]>([]);
  // Pagination
  currentPage = signal(1);
  totalPages = signal(1);
  totalRecords = signal(0);

  // Async Form Pending Load Trackers
  isCheckingPatient = signal(false);
  isCreatingPatient = signal(false);
  isUpdatingPatient = signal(false);
  editingPatientUhid = signal<string | null>(null);
  isEditingMode = computed(() => !!this.editingPatientUhid());
  isSavingPatient = computed(() => this.isCreatingPatient() || this.isUpdatingPatient());

  // Notifications & Feedback Messages
  statusMessage = signal<string | null>('');
  successMessage = signal<string | null>('');

  // Search Engine Value Tracker
  searchText = signal('');

  // Pre-Verification Email Control
  emailControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

  //form builder for patient form
  private fb = inject(NonNullableFormBuilder);
  patientForm = this.fb.group({

    userFields: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      roleName: [{ value: 'Patient', disabled: true }, Validators.required]
    }),

    patientFields: this.fb.group({
      gender: ['', Validators.required],
      dob: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      address: ['', Validators.required],
      emergencyContactName: ['', Validators.required],
      emergencyContactPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    })

  });

  constructor(private patientService: PatientService, private cdr: ChangeDetectorRef) {
    effect(() => {
      const text = this.searchText();
      console.log("searching text ...:", text);

      const handler = setTimeout(() => {
        this.loadPatients(1, text);
      }, 400);

      return () => clearTimeout(handler);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(page: number = 1, search: string = this.searchText()): void {
    this.patientService.getPatientSummary(page, search).subscribe({
      next: (res) => {
        this.patients.set(res.data.patientData || []);
        console.log('patients Data : ', res.data.patientData);
        const paginationData = res.data.pagination;
        if (paginationData) {
          this.currentPage.set(paginationData.currentPage);
          this.totalPages.set(paginationData.totalPages);
          this.totalRecords.set(paginationData.total);
        }
      },
      error: (err) => console.error('Failed to load patient ledger data:', err)
    });
  }

  togglePatient(patientUhid: string): void {
    this.closePatientActionMenu();

    if (this.expandedPatientId() === patientUhid) {
      this.expandedPatientId.set(null);
      this.selectedPatient.set(null);
      return;
    }
    this.expandedPatientId.set(patientUhid);
    this.selectedPatient.set(null);

    this.patientService.getPatientByUhid(patientUhid).subscribe({
      next: (res) => {
        if (this.expandedPatientId() === patientUhid) {
          this.selectedPatient.set(res.data);
        }
      },
      error: (err) => {
        console.error('Failed to resolve patient metadata via database index lookups:', err);
        this.selectedPatient.set(null);
        this.expandedPatientId.set(null);
      }
    });
  }

  canEditPatient(): boolean {
    return this.patientService.canEditPatient();
  }

  canAddPatient(): boolean {
    return this.patientService.canAddPatient();
  }

  togglePatientActionMenu(event: Event, patientUhid: string): void {
    event.stopPropagation();
    this.activeMenuPatientId.update(current => current === patientUhid ? null : patientUhid);
  }

  closePatientActionMenu(): void {
    this.activeMenuPatientId.set(null);
  }

  onAddPatient(): void {
    this.editingPatientUhid.set(null);
    this.emailControl.reset();
    this.statusMessage.set('');
    this.showEmailCheckingForm.set(true);
    this.showPatientForm.set(false);
    this.patientForm.reset();
    this.patientForm.controls.userFields.controls.email.enable();
    document.body.style.overflow = 'hidden';
  }

  checkPatient(): void {
    if (this.emailControl.invalid) return;

    this.isCheckingPatient.set(true);
    this.statusMessage.set('');
    const email = this.emailControl.value!.trim();

    this.patientService.checkPatientExists(email).subscribe({
      next: (res) => {
        this.isCheckingPatient.set(false);

        if (res.data.exist) {
          this.statusMessage.set('Patient already exists with this email address.');
        } else {
          this.patientForm.reset();
          this.patientForm.controls.userFields.patchValue({ email: email });
          this.showEmailCheckingForm.set(false);
          this.showPatientForm.set(true);
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.isCheckingPatient.set(false);
        this.statusMessage.set('Error verifying registration parameters. Please retry.');
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    this.submitPatientRegistration();
  }

  submitPatientRegistration(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isCreatingPatient.set(true);
    const userValues = this.patientForm.controls.userFields.getRawValue();
    const patientValues = this.patientForm.controls.patientFields.getRawValue();
    const payload: CreatePatientRequest = {
      ...userValues,
      ...patientValues
    } as CreatePatientRequest;

    this.patientService.createPatient(payload).subscribe({
      next: (res) => {
        this.isCreatingPatient.set(false);
        this.closeModal();
        this.loadPatients(this.currentPage(), this.searchText());
      },
      error: (err) => {
        this.isCreatingPatient.set(false);
        console.error('Registration processing fault:', err);
      }
    });
  }

  submitPatientUpdate(): void {
    const targetUhid = this.editingPatientUhid();
    if (!targetUhid) return;

    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isUpdatingPatient.set(true);
    const userValues = this.patientForm.controls.userFields.getRawValue();
    const patientValues = this.patientForm.controls.patientFields.getRawValue();
    const payload: Partial<CreatePatientRequest> = {
      ...userValues,
      ...patientValues
    };

    this.patientService.updatePatient(targetUhid, payload).subscribe({
      next: () => {
        this.isUpdatingPatient.set(false);
        this.closePatientModal();
        this.loadPatients(this.currentPage(), this.searchText());
      },
      error: (err) => {
        this.isUpdatingPatient.set(false);
        console.error('Patient update processing fault:', err);
      }
    });
  }

  onPatientEditModal(patientId: string) {
    this.closePatientActionMenu();
    this.patientService.getPatientByUhid(patientId)
      .subscribe(
        {
          next: (res) => {
            const patient: PatientDetails = res.data;
            this.editingPatientUhid.set(patient.UHID);
            this.patientForm.patchValue(
              {
                userFields: {
                  firstName: patient.userId?.firstName || '',
                  lastName: patient.userId?.lastName || '',
                  email: patient.userId?.email || '',
                  phone: patient.userId?.phone || '',
                  roleName: 'Patient'
                },
                patientFields: {
                  gender: patient.gender || '',
                  dob: patient.dob ? new Date(patient.dob).toISOString().substring(0, 10) : '',
                  bloodGroup: patient.bloodGroup || '',
                  address: patient.address || '',
                  emergencyContactName: patient.emergencyContactName || '',
                  emergencyContactPhone: patient.emergencyContactPhone || ''
                }
              }
            );
            this.patientForm.markAsPristine();
            this.patientForm.markAsUntouched();
            this.patientForm.controls.userFields.controls.email.disable();
            this.showEmailCheckingForm.set(false);
            this.showPatientForm.set(true);
            document.body.style.overflow = 'hidden';
          }
        }
      )
  }

  closePatientModal(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.showEmailCheckingForm.set(false);
    this.showPatientForm.set(false);
    this.editingPatientUhid.set(null);
    this.isUpdatingPatient.set(false);
    this.patientForm.reset();
    this.patientForm.controls.userFields.controls.email.enable();
    this.emailControl.reset();
    this.statusMessage.set('');
    document.body.style.overflow = 'auto';
  }

  // Navigation Methods 
  goToNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.loadPatients(this.currentPage() + 1, this.searchText());
    }
  }

  goToPrevPage(): void {
    if (this.currentPage() > 1) {
      this.loadPatients(this.currentPage() - 1, this.searchText());
    }
  }
}
