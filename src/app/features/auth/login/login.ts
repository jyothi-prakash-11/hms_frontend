import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginRequest } from '../auth.model';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import ToastService from '../../../shared/components/toast/toast.service';
import { ToastComponent } from "../../../shared/components/toast/toast";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, ToastComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  constructor(private readonly authService: AuthService, private readonly router: Router, private toastService: ToastService) { }
  errorMessage = '';
  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.required]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(6), Validators.required]
    })
  });
  onLogin() {
    const authData: LoginRequest = this.loginForm.getRawValue();
    console.log("authData : ", authData);
    this.authService.loginUser(authData).subscribe({
      next: (res) => {
        console.log("Login response:", res);
        console.log("LocalStorage after login:", localStorage.getItem('token'), localStorage.getItem('role'));
        const path = this.authService.getDashboardByRole(res.data.role) + '/dashboard';
        console.log("Navigating to:", path);
        this.toastService.success('welcome back');
        this.router.navigateByUrl(path);
      },
      error: (err) => {
        console.error("Login error:", err);
        const errorMsg = err?.error?.message || err?.message || 'Login failed';
        this.toastService.error(errorMsg);
        console.log(errorMsg);
        this.errorMessage = errorMsg;
      }
    });
  }
}
