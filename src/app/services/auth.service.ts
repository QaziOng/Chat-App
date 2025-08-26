import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7276/api/auth'; // your ASP.NET backend

  constructor(private http: HttpClient) {}

  register(model: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, model);
  }

  login(model: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, model);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }
}
