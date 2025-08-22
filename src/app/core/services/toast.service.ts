import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast { text: string; kind?: 'success'|'error'|'info' }

@Injectable({ providedIn: 'root' })
export class ToastService {
  public stream = new Subject<Toast>();
  show(text: string, kind: Toast['kind'] = 'info') { this.stream.next({ text, kind }); }
}


