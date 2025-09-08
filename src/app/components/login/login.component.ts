// src/app/components/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: 'login.component.html',
  styleUrl: 'login.component.scss'
})
export class LoginComponent {
  userName = '';
  password = '';
  showPassword: boolean = false;
  errorMessage = signal<string | null>(null);

  private router = inject(Router);
  private authService = inject(AuthService);

  onSubmit() {
    const model = {
      userName: this.userName,   // backend expects "userName"
      password: this.password
    };

    this.authService.login(model).subscribe({
      next: (res) => {
        console.log('Login success:', res);

        // Save JWT token
        localStorage.setItem('token', res.token);

        // Navigate to home after login
        this.router.navigate(['home']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage.set('Invalid username or password');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
