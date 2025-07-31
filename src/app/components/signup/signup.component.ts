// // src/app/components/signup/signup.component.ts

// import { Component, inject, signal } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { useAuthStore } from '../../stores/auth.store';

// @Component({
//   selector: 'app-signup',
//   standalone: true,
//   imports: [FormsModule, RouterModule],
//   templateUrl: 'signup.component.html'
// })
// export class SignupComponent {
//   email = '';
//   password = '';
//   displayName = '';
//   showPassword: boolean = false;
//   errorMessage = signal<string | null>(null);
//   private authStore = inject(useAuthStore);
//   private router = inject(Router);

//   async onSubmit() {
//     try {
//       console.log(this.displayName);
//       await this.authStore.signUp(this.email, this.password, this.displayName);
//       this.router.navigate(['/chat']);
//       // Navigate to chat list after successful signup
//     } catch (error) {
//       console.error('Signup error:', error);
//       if (error instanceof Error) {
//         this.errorMessage.set(error.message);
//       } else {
//         this.errorMessage.set(
//           'An unexpected error occurred. Please try again.'
//         );
//       }
//     }
//   }
// }

// src/app/components/signup/signup.component.ts

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { useAuthStore } from '../../stores/auth.store';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: 'signup.component.html'
})
export class SignupComponent {
  email = '';
  password = '';
  displayName = '';
  showPassword: boolean = false; // 👁️ used for toggling password visibility
  errorMessage = signal<string | null>(null);
  private authStore = inject(useAuthStore);
  private router = inject(Router);

  async onSubmit() {
    try {
      console.log(this.displayName);
      await this.authStore.signUp(this.email, this.password, this.displayName);
      this.router.navigate(['/home/chat']);
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        this.errorMessage.set(error.message);
      } else {
        this.errorMessage.set(
          'An unexpected error occurred. Please try again.'
        );
      }
    }
  }

  // 👇 New method to toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
