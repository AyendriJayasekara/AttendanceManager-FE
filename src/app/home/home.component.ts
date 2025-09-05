import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';

import { AttendanceService, AttendanceRecord, SearchCriteria } from '../services/attendance.service';
import { MyFormDialogComponent, DialogData } from '../my-form-dialog/my-form-dialog.component';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  attendanceRecords: (AttendanceRecord & { 
    isEditing?: boolean;
    editCheckInDate?: Date;
    editCheckInTime?: string;
    editCheckOutTime?: string;
  })[] = [];
  displayedColumns: string[] = ['checkInDate', 'checkInTime', 'checkOutTime', 'actions'];
  maxDate = new Date();
  
  searchCriteria: SearchCriteria = {
    startDate: null,
    endDate: null
  };

  private destroy$ = new Subject<void>();

  constructor(
    private attendanceService: AttendanceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAttendanceRecords();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAttendanceRecords(): void {
    this.attendanceService.getAttendanceRecords()
      .pipe(takeUntil(this.destroy$))
      .subscribe(records => {
        this.attendanceRecords = records;
      });
  }

  searchRecords(): void {         // Triggered when the user clicks the search button//
    if (this.searchCriteria.startDate || this.searchCriteria.endDate) {
      this.attendanceService.searchAttendanceRecords(this.searchCriteria)
        .pipe(takeUntil(this.destroy$))
        .subscribe(records => {
          this.attendanceRecords = records;
          this.showSnackBar(`Found ${records.length} record(s)`);
        });
    } else {
      this.loadAttendanceRecords();
    }
  }

  clearSearch(): void {
    this.searchCriteria = {
      startDate: null,
      endDate: null
    };
    this.loadAttendanceRecords();
    this.showSnackBar('Search cleared');
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(MyFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' } as DialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.attendanceService.addAttendanceRecord(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showSnackBar('Attendance record added successfully!');
              },
              error: (error) => {
                this.showSnackBar('Error adding record: ' + error.message);
              }
            });
        }
      });
  }

  openUpdateDialog(record: AttendanceRecord): void {
    const dialogRef = this.dialog.open(MyFormDialogComponent, {
      width: '600px',
      data: { mode: 'update', record } as DialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result && result.id) {
          this.attendanceService.updateAttendanceRecord(result.id, result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showSnackBar('Attendance record updated successfully!');
              },
              error: (error) => {
                this.showSnackBar('Error updating record: ' + error.message);
              }
            });
        }
      });
  }

  deleteRecord(id: string): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      disableClose: false,
      autoFocus: false,
      panelClass: 'delete-dialog'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.attendanceService.deleteAttendanceRecord(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                // We'll always get a success response now
                this.showSnackBar('Attendance record deleted successfully!');
              },
              error: (error) => {
                // This will only happen for real errors (network issues, server errors)
                this.showSnackBar('Unable to connect to the server. Please try again.');
              }
            });
        }
      });
  }

  formatDate(date: Date): string {
    // Ensure we're working with a Date object
    const dateObj = new Date(date);
    // Set time to midnight to avoid timezone issues
    dateObj.setHours(0, 0, 0, 0);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  startEditing(record: any): void {
    record.isEditing = true;
    // Create a new Date object and set to midnight
    const date = new Date(record.checkInDate);
    date.setHours(0, 0, 0, 0);
    
    record.editCheckInDate = date;
    record.editCheckInTime = record.checkInTime;
    record.editCheckOutTime = record.checkOutTime || '';
  }

  cancelEditing(record: any): void {
    record.isEditing = false;
    record.editCheckInDate = undefined;
    record.editCheckInTime = undefined;
    record.editCheckOutTime = undefined;
  }

  saveRecord(record: any): void {
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!record.editCheckInDate) {
      this.showSnackBar('Please enter a valid date');
      return;
    }

    if (!timePattern.test(record.editCheckInTime)) {
      this.showSnackBar('Please enter a valid check-in time in HH:MM format');
      return;
    }

    if (record.editCheckOutTime && !timePattern.test(record.editCheckOutTime)) {
      this.showSnackBar('Please enter a valid check-out time in HH:MM format');
      return;
    }

    // Ensure we have a proper Date object
    const checkInDate = record.editCheckInDate instanceof Date 
      ? record.editCheckInDate 
      : new Date(record.editCheckInDate);

    // Create the updated record with the proper date
    const updatedRecord = {
      ...record,
      checkInDate: checkInDate,
      checkInTime: record.editCheckInTime,
      checkOutTime: record.editCheckOutTime || null
    };

    this.attendanceService.updateAttendanceRecord(record.id, updatedRecord)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          record.checkInDate = record.editCheckInDate;
          record.checkInTime = record.editCheckInTime;
          record.checkOutTime = record.editCheckOutTime || null;
          record.isEditing = false;
          record.editCheckInDate = undefined;
          record.editCheckInTime = undefined;
          record.editCheckOutTime = undefined;
          this.showSnackBar('Record updated successfully!');
        },
        error: (error) => {
          this.showSnackBar('Error updating record: ' + error.message);
        }
      });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
