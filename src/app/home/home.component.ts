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
  attendanceRecords: AttendanceRecord[] = [];
  displayedColumns: string[] = ['checkInDate', 'checkInTime', 'checkOutDate', 'checkOutTime', 'actions'];
  
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

  openAddDialog(): void { // Opens a dialog //
    const dialogRef = this.dialog.open(MyFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' } as DialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.attendanceService.addAttendanceRecord(result);
          this.showSnackBar('Attendance record added successfully!');
          this.loadAttendanceRecords();
        }
      });
  }

  openUpdateDialog(record: AttendanceRecord): void {// Opens a dialog for updating //
    const dialogRef = this.dialog.open(MyFormDialogComponent, {
      width: '600px',
      data: { mode: 'update', record } as DialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result && result.id) {
          this.attendanceService.updateAttendanceRecord(result.id, result);
          this.showSnackBar('Attendance record updated successfully!');
          this.loadAttendanceRecords();
        }
      });
  }

  deleteRecord(id: string): void {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      this.attendanceService.deleteAttendanceRecord(id);
      this.showSnackBar('Attendance record deleted successfully!');
      this.loadAttendanceRecords();
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
