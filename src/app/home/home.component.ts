import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, LoginComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
