import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent {
  personalInfoForm: FormGroup;
  isEditMode = false;
  originalFormData: any;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.personalInfoForm = this.createForm();
    this.loadSampleData();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      employeeId: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      department: ['', Validators.required],
      jobTitle: ['', Validators.required],
      dateOfBirth: [''],
      dateOfJoining: ['', Validators.required],
      manager: [''],
      employeeType: [''],
      address: ['']
    });
  }

  private loadSampleData(): void {
    // Load sample data 
    const sampleData = {
      employeeId: 'EMP001',
      fullName: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      department: 'IT',
      jobTitle: 'Software Developer',
      dateOfBirth: new Date('1990-05-15'),
      dateOfJoining: new Date('2022-01-15'),
      manager: 'Jane Smith',
      employeeType: 'Full-time',
      address: '123 Main Street, Suite 100, City, State 12345'
    };
    
    this.personalInfoForm.patchValue(sampleData);
    this.originalFormData = { ...sampleData };
  }

  enableEditMode(): void {
    this.isEditMode = true;
    this.originalFormData = { ...this.personalInfoForm.value };
  }

  savePersonalInfo(): void {
    if (this.personalInfoForm.valid) {
      // In a real application, you would send this data to a backend service
      console.log('Saving personal info:', this.personalInfoForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.isEditMode = false;
        this.snackBar.open('Personal information saved successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 500);
    } else {
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  quickSave(): void {
    // Quick save function that works regardless of edit mode
    if (this.personalInfoForm.valid) {
      // In a real application, you would send this data to a backend service
      console.log('Quick saving personal info:', this.personalInfoForm.value);
      
      // API call
      setTimeout(() => {
        this.snackBar.open('Information saved successfully!', 'Close', {
          duration: 2500,
          panelClass: ['success-snackbar']
        });
        // Update the original form data 
        this.originalFormData = { ...this.personalInfoForm.value };
      }, 300);
    } else {
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  cancelEdit(): void {
    this.personalInfoForm.patchValue(this.originalFormData);
    this.isEditMode = false;
    this.snackBar.open('Changes cancelled.', 'Close', {
      duration: 2000
    });
  }
}