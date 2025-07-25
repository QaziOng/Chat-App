import { Component } from '@angular/core';
import { SignupComponent } from '../components/signup/signup.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SignupComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
