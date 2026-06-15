import { Component, OnInit, signal } from '@angular/core';
import { AppointmentResponse } from './appointment.model';
import AppointmentService from './appointmet.service';
import { DatePipe } from '@angular/common';
import { AddAppointmentForm } from "../../shared/components/add-appointment-form/add-appointment-form";
import { finalize } from 'rxjs';
import ToastService from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-appointments',
  imports: [DatePipe, AddAppointmentForm],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css',
})
export class Appointments implements OnInit {
  constructor(private appointmentService: AppointmentService, private toastService: ToastService) { }
  // data holders
  appointments = signal<AppointmentResponse[]>([]);
  expandedAppointmentId = signal<string | null>(null);
  //status flags 
  showAddAppointment = signal<boolean>(false);
  canAddAppointments = signal<boolean>(false);
  canUpdateAppointment = signal<boolean>(false);
  isUpdating = signal<boolean>(false);
  // initial load
  ngOnInit(): void {
    this.loadAppointments();
    this.checkCanAddAppointment();
    this.checkCanUpdateAppointment();
  }
  loadAppointments() {
    this.appointmentService.getAppointments()
      .subscribe(
        {
          next: (res) => {
            console.log("Appointments data ", res);
            this.appointments.set(res.data);
          }
        }
      )
  }
  toggleAppointment(appointmentId: string) {
    if (this.expandedAppointmentId() === appointmentId) {
      this.expandedAppointmentId.set(null);
      return;
    }
    this.expandedAppointmentId.set(appointmentId);
  }
  updateStatus(appointmentId: string, status: string) {
    console.log('Updated Status', status);
  }
  checkCanAddAppointment() {
    console.log('checking can add appointments');
    const res = this.appointmentService.canAddAppointment();
    this.canAddAppointments.set(res);
  }
  checkCanUpdateAppointment() {
    console.log('checking can update appointment staus...');
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
  }
  updateAppointmentStatus(id: string, status: string) {
    console.log('updating status ...', status);
    if (status == 'CANCELLED') {
      const confirmCancel = confirm('Are you sure , you want to cancel the appointment');
      if (!confirmCancel) {
        return;
      }
    }
    this.isUpdating.set(true);
    this.appointmentService.updateAppointmentStatus(id, status)
      .pipe(
        finalize(() => {
          this.isUpdating.set(false);
        })
      )
      .subscribe(
        {
          next: (res) => {
            this.appointments.update(list => list.map(appt => appt._id === id ? res.data : appt));
            this.toastService.info('status updated successfully');
          }
        }
      )
  }
}
