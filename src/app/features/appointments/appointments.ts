import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppointmentResponse } from './appointment.model';
import AppointmentService from './appointmet.service';
import { AddAppointmentForm } from "../../shared/components/add-appointment-form/add-appointment-form";
import { finalize } from 'rxjs';
import ToastService from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [DatePipe, AddAppointmentForm],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css',
})
export class Appointments implements OnInit {
  constructor(
    private appointmentService: AppointmentService,
    private toastService: ToastService
  ) { }

  // Dynamic State Signals
  appointments = signal<AppointmentResponse[]>([]);
  expandedAppointmentId = signal<string | null>(null);
  searchQuery = signal<string>('');
  selectedDate = signal<string>('');

  // Permission & Loading Flags 
  showAddAppointment = signal<boolean>(false);
  canAddAppointments = signal<boolean>(false);
  canUpdateAppointment = signal<boolean>(false);
  isUpdating = signal<boolean>(false);

  // High-Performance Frontend Filter Pipeline
  filteredAppointments = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const currentList = this.appointments();

    if (!query) return currentList;

    return currentList.filter(appt => {
      const patientUser = appt.patientId?.userId;
      const doctorUser = appt.doctorId?.employeeId?.userId;

      return (
        appt.appointmentId?.toLowerCase().includes(query) ||
        appt.patientId?.UHID?.toLowerCase().includes(query) ||
        patientUser?.firstName?.toLowerCase().includes(query) ||
        patientUser?.lastName?.toLowerCase().includes(query) ||
        patientUser?.phone?.includes(query) ||
        doctorUser?.firstName?.toLowerCase().includes(query) ||
        doctorUser?.lastName?.toLowerCase().includes(query)
      );
    });
  });

  ngOnInit(): void {
    // Automatically capture today's local date string anchor structure (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    this.selectedDate.set(todayStr);

    this.loadAppointments(todayStr);
    this.checkCanAddAppointment();
    this.checkCanUpdateAppointment();
  }

  loadAppointments(dateQuery?: string) {
    const targetDate = dateQuery || this.selectedDate();

    this.appointmentService.getAppointments(targetDate)
      .subscribe({
        next: (res) => {
          console.log("Appointments data initialized:", res);
          this.appointments.set(res.data || []);
        },
        error: () => {
          this.toastService.info('Failed to load appointments calendar dataset');
          this.appointments.set([]);
        }
      });
  }

  onDateChange(newDate: string) {
    if (!newDate) return;
    this.selectedDate.set(newDate);
    this.loadAppointments(newDate);
  }

  applyLocalSearch(value: string) {
    this.searchQuery.set(value);
  }

  toggleAppointment(appointmentId: string) {
    if (this.expandedAppointmentId() === appointmentId) {
      this.expandedAppointmentId.set(null);
      return;
    }
    this.expandedAppointmentId.set(appointmentId);
  }

  checkCanAddAppointment() {
    const res = this.appointmentService.canAddAppointment();
    this.canAddAppointments.set(res);
  }

  checkCanUpdateAppointment() {
    const res = this.appointmentService.canUpdateAppointment();
    this.canUpdateAppointment.set(res);
  }

  openAppointment() {
    this.showAddAppointment.set(true);
  }

  closeAppointment() {
    this.showAddAppointment.set(false);
  }

  onAppointmentCreated(appointment: AppointmentResponse) {
    this.appointments.update(current => [appointment, ...current]);
    this.showAddAppointment.set(false);
    this.toastService.info('Appointment created successfully');
  }

  updateAppointmentStatus(id: string, status: string) {
    if (status === 'CANCELLED') {
      const confirmCancel = confirm('Are you sure you want to cancel this appointment?');
      if (!confirmCancel) {
        // Reset element selection rendering value if validation fails
        this.loadAppointments();
        return;
      }
    }

    this.isUpdating.set(true);
    this.appointmentService.updateAppointmentStatus(id, status)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (res) => {
          this.appointments.update(list => list.map(appt => appt._id === id ? res.data : appt));
          this.toastService.info('Status updated successfully');
        }
      });
  }
}