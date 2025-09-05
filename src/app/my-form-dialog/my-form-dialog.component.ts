import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { AttendanceRecord } from '../services/attendance.service';

export interface AttendanceFormData {
  checkInDate: Date | null;
  checkInTime: string;
  checkOutTime: string | null;
}

export interface DialogData {
  mode: 'create' | 'update';
  record?: AttendanceRecord;
}

@Component({
  selector: 'app-my-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, 
    MatButtonModule, 
    MatDatepickerModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatNativeDateModule,
    FormsModule
  ],
  templateUrl: './my-form-dialog.component.html',
  styleUrl: './my-form-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyFormDialogComponent implements OnInit {
  attendanceData: AttendanceFormData = {
    checkInDate: null,
    checkInTime: '',
    checkOutTime: null
  };

  isUpdateMode = false;
  dialogTitle = 'Add Attendance Record';
  maxDate = new Date();  // This will be used to prevent future date selection

  constructor(
    public dialogRef: MatDialogRef<MyFormDialogComponent>,//   reference to the dialog window that opened this component

    @Inject(MAT_DIALOG_DATA) public data: DialogData//   data passed to the dialog when it was opened
  ) {}

  ngOnInit(): void {
    this.isUpdateMode = this.data.mode === 'update';
    this.dialogTitle = this.isUpdateMode ? 'Update Attendance Record' : 'Add Attendance Record';
    
    if (this.isUpdateMode && this.data.record) {
      this.attendanceData = {
        checkInDate: new Date(this.data.record.checkInDate),
        checkInTime: this.data.record.checkInTime,
        checkOutTime: this.data.record.checkOutTime
      };
    }
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      const result = {
        ...this.attendanceData,
        id: this.data.record?.id
      };
      this.dialogRef.close(result);
    }
  }

  private isFormValid(): boolean {
    if (this.isUpdateMode) {
      return !!(
        this.attendanceData.checkInDate &&
        this.attendanceData.checkInTime &&
        this.attendanceData.checkOutTime
      );
    } else {
      return !!(
        this.attendanceData.checkInDate &&
        this.attendanceData.checkInTime
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}


