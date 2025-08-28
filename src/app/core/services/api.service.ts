import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiBaseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  public post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiBaseUrl}${path}`, body);
  }
  public get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.apiBaseUrl}${path}`);
  }
}
