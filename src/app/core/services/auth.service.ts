import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'sf_jwt';
  private readonly userKey = 'sf_user';

  constructor(private readonly api: ApiService, private readonly router: Router) { }

  public signup(payload: { name: string; email: string; password: string; }): Observable<{ token: string } & any> {
    return this.api.post<{ token: string } & any>('/auth/signup', payload).pipe(
      tap((res) => { this.setToken(res.token); this.setUser(res.user); })
    );
  }

  public login(payload: { email: string; password: string; }): Observable<{ token: string } & any> {
    return this.api.post<{ token: string } & any>('/auth/login', payload).pipe(
      tap((res) => { this.setToken(res.token); this.setUser(res.user); })
    );
  }

  public logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/auth/login']);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public getUser(): { id: string; name: string; email: string } | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: { id: string; name: string; email: string }): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}
