import { Component, OnInit, signal } from '@angular/core';
import { CreateDoctorRequest, DoctorResponse } from './doctor.model';
import { DoctorService } from './doctor.service';
import { finalize } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-doctor',
  imports: [ReactiveFormsModule],
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
  // doctor form
  doctorForm =
    new FormGroup({

      firstName:
        new FormControl(
          '',
          [
            Validators.required
          ]
        ),

      lastName:
        new FormControl(
          '',
          [
            Validators.required
          ]
        ),

      email:
        new FormControl(
          '',
          [
            Validators.required,
            Validators.email
          ]
        ),

      phone:
        new FormControl(
          '',
          [
            Validators.required,
            Validators.pattern(
              '^[0-9]{10}$'
            )
          ]
        ),
      department:
        new FormControl(
          '',
          [
            Validators.required
          ]
        ),

      designation:
        new FormControl(
          '',
          [
            Validators.required
          ]
        ),

      joiningDate:
        new FormControl(
          '',
          [
            Validators.required
          ]
        ),
      specialization:
        new FormControl(
          '',
          [
            Validators.required
          ]
        ),

      qualification:
        new FormControl(
          '',
          [
            Validators.required
          ]
        ),

      consultationFee:
        new FormControl<Number>(
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ),

      medicalRegistrationNo:
        new FormControl(
          '',
          [
            Validators.required
          ]
        ),

      experienceYears:
        new FormControl<Number>(
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ),

      availabilityStartTime:
        new FormControl(
          ''
        ),

      availabilityEndTime:
        new FormControl(
          ''
        )

    });
  constructor(private doctorService: DoctorService) { }
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
            console.log('opening modal');
            this.doctorForm.patchValue({ email: email });
            this.doctorForm.controls.email.disable();
            this.showDoctorEmailForm.set(false);
            this.showDoctorModal.set(true);
            console.log(this.showDoctorModal());
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
    this.doctorForm.reset();
  }
  createDoctor() {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }
    console.log("Doctor Creation Form Values : ", this.doctorForm.getRawValue());
    const payload = this.doctorForm.getRawValue() as CreateDoctorRequest;
    this.isCreatingDoctor.set(true);
    this.doctorService.createDoctor(payload)
    .pipe(
      finalize(()=>{
        this.isCreatingDoctor.set(false);
        setTimeout(()=>{
          this.doctorStatusMessage.set('');
        },5000);
      })
    )
    .subscribe({
      next: (res) => {
        console.log(res);
        this.doctors.update(
          doctors => [
            res.data,
            ...doctors
          ]
        );
        this.doctorStatusMessage.set('Doctor has been created sucessfully');
        this.doctorForm.reset();
        this.closeDoctorModal();
      },
      error:(error)=>{
        this.doctorStatusMessage.set(error.error?.message ??  'Something went wrong');
      }
    });
  }
}
