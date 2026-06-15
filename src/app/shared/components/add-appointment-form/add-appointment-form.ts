import { Component, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import AppointmentFormService from './appointmentForm.service';
import { AppointmentDoctorResponse, AppointmentPatientResponse, CreateAppointmentRequest } from './appointmentForm.model';
import { AppointmentResponse } from '../../../features/appointments/appointment.model';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import ToastService from '../toast/toast.service';

@Component({
  selector: 'app-add-appointment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-appointment-form.html',
  styleUrl: './add-appointment-form.css',
})
export class AddAppointmentForm implements OnInit {
  constructor(private toastService: ToastService) { }
  private appointmentFormService = inject(AppointmentFormService);
  @Output()
  appointmentCreated = new EventEmitter<AppointmentResponse>();
  // Data State Signals
  patients = signal<AppointmentPatientResponse[]>([]);
  doctors = signal<AppointmentDoctorResponse[]>([]);
  selectedPatient = signal<AppointmentPatientResponse | null>(null);
  selectedDoctor = signal<AppointmentDoctorResponse | null>(null);
  isCreatingAppointment = signal<boolean>(false);
  //bounds 
  public minDate = signal<string>('');
  public maxDate = signal<string>('');
  // Slot Management Signals
  availableSlots = signal<string[]>([]);
  isLoadingSlots = signal<boolean>(false);

  // Filtered Output Signals
  filteredPatients = signal<AppointmentPatientResponse[]>([]);
  filteredDoctors = signal<AppointmentDoctorResponse[]>([]);

  // Form Controls Configuration
  appointmentForm = new FormGroup({
    patientId: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    doctorId: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    appointmentDate: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    appointmentTime: new FormControl('', { validators: [Validators.required], nonNullable: true })
  });

  patientSearchControl = new FormControl('', { nonNullable: true });
  doctorSearchControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.listenToSearchChanges();
    this.listenToDateOrDoctorChanges();
    this.calculateDateBounds();
  }

  private listenToSearchChanges(): void {
    // Listen to patient query inputs
    this.patientSearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((val) => {
        const query = val.trim().toLowerCase();
        if (!query) {
          this.filteredPatients.set([]);
          return;
        }
        this.appointmentFormService.searchPatient(query)
          .subscribe(
            {
              next: (res) => {
                console.log('searched patient result : ', res.data);
                this.filteredPatients.set(res.data);
              }
            }
          )
      });

    // Listen to doctor query inputs
    this.doctorSearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((val) => {
        const query = val.trim().toLowerCase();
        if (!query) {
          this.filteredDoctors.set([]);
          return;
        }
        this.appointmentFormService.searchDoctor(query)
          .subscribe(
            {
              next: (res) => {
                console.log('search results for doctor : ', res.data);
                this.filteredDoctors.set(res.data);
              }
            }
          )
      });
  }

  // Automatically fetch slots from the backend when both Doctor ID and Date are populated
  private listenToDateOrDoctorChanges(): void {
    this.appointmentForm.valueChanges.subscribe((formValues) => {
      const { doctorId, appointmentDate } = formValues;

      if (doctorId && appointmentDate) {
        this.isLoadingSlots.set(true);

        this.appointmentFormService.getDoctorSlots(doctorId, appointmentDate).subscribe({
          next: (res) => {
            this.availableSlots.set(res.data);
            this.isLoadingSlots.set(false);
          },
          error: (err) => {
            console.error('Error fetching slots:', err);
            this.availableSlots.set([]);
            this.isLoadingSlots.set(false);
          }
        });
      } else {
        this.availableSlots.set([]);
      }
    });
  }

  selectPatient(patient: AppointmentPatientResponse): void {
    this.selectedPatient.set(patient);
    this.appointmentForm.controls.patientId.setValue(patient._id);

    const name = `${patient.UHID} - ${patient.userId?.firstName} ${patient.userId?.lastName}`;
    this.patientSearchControl.setValue(name, { emitEvent: false });
    this.filteredPatients.set([]);
  }

  selectDoctor(doctor: AppointmentDoctorResponse): void {
    this.selectedDoctor.set(doctor);
    this.appointmentForm.controls.doctorId.setValue(doctor._id);

    // Reset the time selection if a new doctor is picked to force re-validation
    this.appointmentForm.controls.appointmentTime.setValue('');

    const name = `Dr. ${doctor.employeeId?.userId?.firstName} ${doctor.employeeId?.userId?.lastName}`;
    this.doctorSearchControl.setValue(name, { emitEvent: false });
    this.filteredDoctors.set([]);
  }

  createAppointment(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.isCreatingAppointment.set(true);
    console.log('Payload Data Sending to API:', this.appointmentForm.value);
    const payload = this.appointmentForm.value as CreateAppointmentRequest;
    this.appointmentFormService.createAppointment(payload)
      .pipe(
        finalize(() => {
          this.isCreatingAppointment.set(false);
        })
      )
      .subscribe(
        {
          next: (res) => {
            this.appointmentCreated.emit(res.data);
            this.appointmentForm.reset();
            this.patientSearchControl.reset();
            this.doctorSearchControl.reset();
          },
          error: (err) => {
            const errorMsg = err?.error?.message || err?.message || 'something went wrong';
            this.toastService.error(errorMsg);
          }
        }
      )
  }

  public isSlotPast(slotStr: string): boolean {
    const chosenDateStr = this.appointmentForm.get('appointmentDate')?.value;
    if (!chosenDateStr) return false;

    const today = new Date();
    const chosenDate = new Date(chosenDateStr);

    // If chosen date is not today, do not gray out morning slots
    if (chosenDate.toDateString() !== today.toDateString()) {
      return false;
    }

    // Parse "HH:mm"
    const [hours, minutes] = slotStr.split(':').map(Number);
    const slotAbsoluteMinutes = (hours * 60) + minutes;
    const currentAbsoluteMinutes = (today.getHours() * 60) + today.getMinutes();

    return slotAbsoluteMinutes <= currentAbsoluteMinutes;
  }
  clearPatient(): void {
    this.selectedPatient.set(null);
    this.patientSearchControl.setValue('');
    this.appointmentForm.controls.patientId.setValue('');
  }

  clearDoctor(): void {
    this.selectedDoctor.set(null);
    this.doctorSearchControl.setValue('');
    this.appointmentForm.controls.doctorId.setValue('');
    this.appointmentForm.controls.appointmentTime.setValue('');
    this.availableSlots.set([]);
  }
  private calculateDateBounds(): void {
    const today = new Date();

    // Max date is 4 days from now
    const futureLimit = new Date();
    futureLimit.setDate(today.getDate() + 4);

    // Format helper to match YYYY-MM-DD localized correctly
    this.minDate.set(this.formatDate(today));
    this.maxDate.set(this.formatDate(futureLimit));
  }
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}