import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Msg { role: 'user' | 'assistant'; content: string }

@Component({
  selector: 'app-tutor-page',
  template: `
    <div class="sf-container">
      <div class="sf-card">
        <h2>AI Tutor</h2>
        <div style="display:flex; gap:12px; margin-bottom: 12px;">
          <input class="sf-input" [(ngModel)]="draft" placeholder="Ask anything..." (keyup.enter)="send()" />
          <button class="sf-btn" (click)="send()">Send</button>
          <button class="sf-btn" (click)="voice()"><span class="material-icons">mic</span></button>
        </div>
        <div class="grid" style="max-height: 420px; overflow:auto;">
          <div *ngFor="let m of messages" class="sf-card" [style.background]="m.role==='user'? 'var(--sf-card)' : 'var(--sf-surface)'"><strong>{{ m.role==='user' ? 'You' : 'Tutor' }}</strong><p>{{ m.content }}</p></div>
        </div>
      </div>
      <div class="sf-card" style="margin-top:16px;">
        <h3>Run Code (Node)</h3>
        <textarea class="sf-input" rows="6" [(ngModel)]="code" placeholder="console.log('Hello')"></textarea>
        <div style="margin-top:8px; display:flex; gap:12px;">
          <button class="sf-btn" (click)="run()">Run</button>
        </div>
        <pre style="white-space: pre-wrap;">{{ output }}</pre>
      </div>
    </div>
  `,
  styles: ``
})
export class TutorPageComponent {
  public draft = '';
  public messages: Msg[] = [];
  public code = "console.log('Hello SkillForge')";
  public output = '';

  constructor(private readonly http: HttpClient) {}

  send(): void {
    if (!this.draft.trim()) return;
    const toSend = this.draft.trim();
    this.messages.push({ role: 'user', content: toSend });
    this.draft = '';
    this.http.post<{ reply: string }>(`${environment.apiUrl || 'http://localhost:5050'}/api/tutor/ask`, { message: toSend, history: this.messages }).subscribe({
      next: (res) => this.messages.push({ role: 'assistant', content: res.reply }),
      error: () => this.messages.push({ role: 'assistant', content: 'Error contacting tutor.' }),
    });
  }

  voice(): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported');
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      this.draft = text;
    };
    recog.start();
  }

  run(): void {
    this.http.post<{ stdout: string; stderr: string }>(`${environment.apiUrl || 'http://localhost:5050'}/api/runner/node`, { code: this.code }).subscribe({
      next: (res) => { this.output = (res.stdout || '') + (res.stderr ? '\n' + res.stderr : ''); },
      error: () => { this.output = 'Run failed'; },
    });
  }
}


