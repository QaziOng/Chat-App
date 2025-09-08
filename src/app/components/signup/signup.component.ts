// src/app/components/signup/signup.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { useAuthStore } from '../../stores/auth.store';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: 'signup.component.html',
  styleUrls: ['signup.component.scss']
})
export class SignupComponent {
  model = {
    userName: '',
    email: '',
    password: '',
    displayName: ''
  };

  showPassword = false;

  // signals for messages
  errors = signal<string[]>([]);
  successMessage = signal<string | null>(null);

  private authStore = inject(useAuthStore);
  private router = inject(Router);
  private authService = inject(AuthService);

  async onSubmit() {
    this.errors.set([]);
    this.successMessage.set(null);

    this.authService.register(this.model).subscribe({
      next: (res) => {
        console.log('Registered successfully', res);

        // ✅ Show inline success message instead of alert
        this.successMessage.set('Account created successfully! Logging you in...');

        // ✅ Immediately log the user in
        const loginModel = {
          userName: this.model.userName,
          password: this.model.password
        };

        this.authService.login(loginModel).subscribe({
          next: (loginRes) => {
            console.log('Auto-login success:', loginRes);

            localStorage.setItem('token', loginRes.token);

            // Redirect to home
            this.router.navigate(['home']);
          },
          error: (loginErr) => {
            console.error('Auto-login failed after signup:', loginErr);
            this.errors.set(['Account created, but login failed. Please log in manually.']);
          }
        });
      },
      error: (err) => {
        console.error('Register error', err);

        if (Array.isArray(err?.error)) {
          this.errors.set(err.error.map((e: any) => e?.description ?? String(e)));
        } else if (typeof err?.error === 'string') {
          this.errors.set([err.error]);
        } else if (err?.error?.errors) {
          const modelErrors = Object.values(err.error.errors).flat() as string[];
          this.errors.set(modelErrors.length ? modelErrors : [err?.error?.title ?? 'Validation failed']);
        } else {
          this.errors.set(['An unexpected error occurred. Please try again.']);
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
