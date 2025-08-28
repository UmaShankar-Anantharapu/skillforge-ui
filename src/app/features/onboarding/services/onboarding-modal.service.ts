import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { OnboardingModalComponent, OnboardingModalData } from '../components/onboarding-modal/onboarding-modal.component';

@Injectable({
  providedIn: 'root'
})
export class OnboardingModalService {
  private currentDialogRef: MatDialogRef<OnboardingModalComponent> | null = null;

  constructor(private dialog: MatDialog) {}

  /**
   * Open the onboarding modal
   */
  openOnboardingModal(data?: OnboardingModalData): Observable<any> {
    // Close existing modal if open
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }

    // Open new modal
    this.currentDialogRef = this.dialog.open(OnboardingModalComponent, {
      width: '70vw',
      height: '70vh',
      maxWidth: '1200px',
      maxHeight: '800px',
      disableClose: true,
      panelClass: ['onboarding-modal-panel'],
      data: data || {}
    });

    // Clear reference when modal closes
    this.currentDialogRef.afterClosed().subscribe(() => {
      this.currentDialogRef = null;
    });

    return this.currentDialogRef.afterClosed();
  }

  /**
   * Close the current onboarding modal
   */
  closeOnboardingModal(result?: any): void {
    if (this.currentDialogRef) {
      this.currentDialogRef.close(result);
    }
  }

  /**
   * Check if onboarding modal is currently open
   */
  isModalOpen(): boolean {
    return this.currentDialogRef !== null;
  }

  /**
   * Get the current modal reference
   */
  getCurrentModalRef(): MatDialogRef<OnboardingModalComponent> | null {
    return this.currentDialogRef;
  }
}