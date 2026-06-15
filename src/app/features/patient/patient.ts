import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from './patient.service';
import { CreatePatientRequest, PatientDetails, PatientSummary } from './patient.model';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient.html',
  styleUrls: ['./patient.css'],
})
export class Patient implements OnInit {
  // Core State Trackers (Signals)
  patients = signal<PatientSummary[]>([]);
  selectedPatient = signal<PatientDetails | null>(null);
  expandedPatientEmail = signal<string | null>(null);
  showPatientForm = signal(false);
  showEmailCheckingForm = signal(false);

  // Async Async Form Pending Load Trackers
  isCheckingPatient = signal(false);
  isCreatingPatient = signal(false);

  // Notifications & Feedback Messages
  statusMessage = signal<string | null>('');
  successMessage = signal<string | null>('');

  // SEARCH IMPLEMENTATION ENGINE
  // Two-way bound data signal feeding your directory compute pipe
  searchText = signal('');

  // Computed Derived Reactive Signal: Auto-filters the directory array instantly on keystroke changes
  filteredPatients = computed(() => {
    const query = this.searchText().toLowerCase().trim();
    if (!query) {
      return this.patients();
    }
    return this.patients().filter(p =>
      p.userId.firstName.toLowerCase().includes(query) ||
      p.userId.lastName.toLowerCase().includes(query) ||
      p.userId.email.toLowerCase().includes(query) ||
      p.userId.phone.includes(query)
    );
  });

  // Independent Pre-Verification Email Controller Bounds
  emailControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

  // Unified Registration Form Controls Tree Structure
  patientForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    gender: new FormControl('', [Validators.required]),
    dob: new FormControl('', [Validators.required]),
    bloodGroup: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    emergencyContactName: new FormControl('', [Validators.required]),
    emergencyContactPhone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')])
  });

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatientSummary().subscribe({
      next: (res) => {
        this.patients.set(res.data || []);
      },
      error: (err) => console.error('Failed to load patient ledger data:', err)
    });
  }

  togglePatient(email: string): void {
    if (this.expandedPatientEmail() === email) {
      this.expandedPatientEmail.set(null);
      this.selectedPatient.set(null);
      return;
    }

    this.expandedPatientEmail.set(email);
    this.selectedPatient.set(null); // Reset detail viewport to show loading spinner state gracefully

    this.patientService.getPatientByEmail(email).subscribe({
      next: (res) => {
        this.selectedPatient.set(res.data);
      },
      error: (err) => console.error('Failed to resolve targeted patient record details:', err)
    });
  }

  canEditPatient(): boolean {
    return this.patientService.canEditPatient();
  }

  canAddPatient(): boolean {
    return this.patientService.canAddPatient();
  }

  openAddPatient(): void {
    this.emailControl.reset();
    this.statusMessage.set('');
    this.showEmailCheckingForm.set(true);
    this.showPatientForm.set(false);
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
          this.patientForm.patchValue({ email: email });
          this.showEmailCheckingForm.set(false);
          this.showPatientForm.set(true);
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
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isCreatingPatient.set(true);
    const payload = this.patientForm.getRawValue() as CreatePatientRequest;

    this.patientService.createPatient(payload).subscribe({
      next: (res) => {
        this.isCreatingPatient.set(false);

        // Push the newly registered summary record directly to the front of the reactive signals stack array
        this.patients.update(list => [res.data, ...list]);

        this.successMessage.set('Patient registered successfully.');
        setTimeout(() => this.successMessage.set(''), 4000);

        this.closeModal();
      },
      error: (err) => {
        this.isCreatingPatient.set(false);
        console.error('Registration processing fault:', err);
      }
    });
  }

  closeModal(): void {
    this.showEmailCheckingForm.set(false);
    this.showPatientForm.set(false);
    this.patientForm.reset();
    this.emailControl.reset();
    this.statusMessage.set('');
  }
}