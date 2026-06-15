import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CreateEmployeePayload, EmployeesResponse } from './employee.model';
import EmployeeService from './employee.service';
import { FormBuilder, FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserForm } from "../../shared/components/user-form/user-form";
import { EmployeeForm } from "../../shared/components/employee-form/employee-form";
import ToastService from '../../shared/components/toast/toast.service';
import { RolesResponse } from '../auth/auth.model';
import { JoinusService } from '../joinus/joinus.service';

@Component({
  selector: 'app-employee',
  imports: [UserForm, EmployeeForm, ReactiveFormsModule],
  templateUrl: './employee.html',
  styleUrl: './employee.css',
})
export class Employee implements OnInit {
  constructor(private employeeService: EmployeeService, private toastService: ToastService, private joinusService: JoinusService) { }
  //data holders
  employees = signal<EmployeesResponse[]>([]);
  expandedEmployeeCode = signal<string | null>(null);
  roles = signal<RolesResponse[]>([]);
  employeeRoles = computed(() =>
    this.roles().filter(role => role.name !== 'Doctor')
  );
  //status flags
  showEmailForm = signal<boolean>(false);
  showEmployeeForm = signal<boolean>(false);
  isCheckingMail = signal<boolean>(false);
  // email validation 
  emailControl = new FormControl(
    '',
    [
      Validators.required,
      Validators.email
    ]
  );
  //form builder for employee form
  private fb = inject(NonNullableFormBuilder);
  employeeForm = this.fb.group({

    userInfo: this.fb.group({

      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      roleName: ['', Validators.required]
    }),

    employeeInfo: this.fb.group({

      department: ['', Validators.required],
      designation: ['', Validators.required],
      joiningDate: ['', Validators.required]

    })

  });
  ngOnInit(): void {
    this.loadAllEmployees();
  }
  // to load the employes
  loadAllEmployees() {
    this.employeeService.getAllEmployees()
      .subscribe(
        {
          next: (res) => {
            console.log("Employee Data : ", res);
            this.employees.set(res.data);
          }
        }
      );
  }
  toggleEmployee(employeeCode: string) {
    if (this.expandedEmployeeCode() === employeeCode) {
      this.expandedEmployeeCode.set(null);
      return;
    }
    this.expandedEmployeeCode.set(employeeCode);
  }
  createEmployee() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.toastService.error('Please fill in all required fields correctly.');
      return;
    }
    const formValue = this.employeeForm.getRawValue();
    const payload: CreateEmployeePayload = {
      ...formValue.userInfo,
      ...formValue.employeeInfo
    };
    console.log("employee payload", payload);
    this.employeeService.createEmployee(payload)
      .subscribe(
        {
          next: (res) => {
            this.employees.update((currentEmployees) => [res.data, ...currentEmployees]);
            this.toastService.success('Employee added successfully');
            this.employeeForm.reset();
            this.emailControl.reset();
            this.employeeForm.controls.userInfo.controls.email.enable();
            this.showEmployeeForm.set(false);
          },
          error: (err) => {
            this.toastService.error(err?.error?.message || err?.message || 'Something went wrong');
          }
        }
      )
  }
  checkEmail() {
    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }
    const emailValue = this.emailControl.getRawValue();
    this.employeeService.checkEmailStatus(emailValue!)
      .subscribe(
        {
          next: (res) => {
            console.log("doctor exist status : ", res)
            if (res.data.exist) {
              this.toastService.error('account with this already exists');
              return;
            }
            this.showEmailForm.set(false);
            this.showEmployeeForm.set(true);
            const emailControl = this.employeeForm.controls.userInfo.controls.email;
            emailControl.patchValue(emailValue!);
            emailControl.disable();
            this.loadRoles();
          },
        }
      )
  }
  loadRoles() {
    this.joinusService.getRoles()
      .subscribe(
        {
          next: (res) => {
            this.roles.set(res.data);
          }
        }
      )
  }
  onAddEmployee() {
    this.showEmailForm.set(true);
  }
  closeEmployeeModal() {
    this.showEmployeeForm.set(false);
    this.employeeForm.reset();
    this.emailControl.reset();
  }
}
