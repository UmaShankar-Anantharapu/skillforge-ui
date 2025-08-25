import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;
  private themeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  toggleTheme(): void {
    const next = this.isDarkMode ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.isDarkMode = theme === 'dark';
    this.applyTheme();
    this.saveTheme();
    this.themeSubject.next(theme);
  }

  getTheme(): 'light' | 'dark' {
    return this.isDarkMode ? 'dark' : 'light';
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  private saveTheme(): void {
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = !!prefersDark;
    }
    this.applyTheme();
    this.themeSubject.next(this.getTheme());
  }
}