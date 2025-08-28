import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiBaseUrl = 'http://localhost:5000/api';

  constructor(private readonly http: HttpClient) { }

  public post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiBaseUrl}${path}`, body);
  }
  public get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.apiBaseUrl}${path}`);
  }
}
