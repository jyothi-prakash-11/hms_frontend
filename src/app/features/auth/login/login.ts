import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginRequest } from '../auth.model';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  constructor(private readonly authService: AuthService, private readonly router: Router) { }
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
        const path = this.authService.getDashboardByRole(res.data.role);
        console.log("Navigating to:", path);
        this.router.navigateByUrl(path);
      },
      error: (err) => {
        console.error("Login error:", err);
        const errorMsg = err?.error?.message || err?.message || 'Login failed';
        this.errorMessage = errorMsg;
      }
    });
  }
}
