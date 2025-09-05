import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="delete-dialog-content">
      <div class="header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <span>Delete Record</span>
      </div>
      <div mat-dialog-content>
        <p>Are you sure you want to delete this record?</p>
      </div>
      <div mat-dialog-actions>
        <button mat-button (click)="onCancel()">No</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">Yes</button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog-content {
      padding: 16px;
      min-width: 280px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: rgba(0, 0, 0, 0.87);
      font-size: 16px;
      font-weight: 500;
    }
    .warning-icon {
      color: #f44336;
      font-size: 20px;
      height: 20px;
      width: 20px;
    }
    [mat-dialog-content] {
      padding: 0;
      margin: 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.67);
    }
    [mat-dialog-actions] {
      margin: 16px -16px -16px;
      padding: 8px 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      justify-content: flex-end;
    }
    button {
      min-width: 64px;
    }
  `]
})
export class DeleteConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
