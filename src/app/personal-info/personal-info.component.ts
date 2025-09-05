import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PersonalInfoService } from '../services/personal-info.service';

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
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit, OnDestroy {
  personalInfoForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  originalFormData: any;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private personalInfoService: PersonalInfoService
  ) {
    this.personalInfoForm = this.createForm();
  }

  ngOnInit(): void {
    // Load self record on init
    this.loadPersonalInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [''],  // Hidden field for the ID
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

  loadPersonalInfo(): void {
    this.isLoading = true;
    this.personalInfoService.getPersonalInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (info) => {
          this.isLoading = false;
          this.personalInfoForm.patchValue(info);
          this.originalFormData = { ...info };
          this.disableFormControls();
          this.snackBar.open('Personal information loaded successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.isLoading = false;
          if (error.message.includes('not found')) {
            // No record yet - enable edit mode to create first-time record
            this.isEditMode = true;
            this.enableFormControls();
            this.snackBar.open('No record found. Please enter your details and save.', 'Close', {
              duration: 5000,
              panelClass: ['info-snackbar']
            });
          } else {
            this.snackBar.open(error.message, 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        }
      });
  }

  enableEditMode(): void {
    this.isEditMode = true;
    this.originalFormData = { ...this.personalInfoForm.value };
    this.enableFormControls();
  }

  private enableFormControls(): void {
    this.personalInfoForm.get('fullName')?.enable();
    this.personalInfoForm.get('email')?.enable();
    this.personalInfoForm.get('phone')?.enable();
    this.personalInfoForm.get('department')?.enable();
    this.personalInfoForm.get('jobTitle')?.enable();
    this.personalInfoForm.get('dateOfBirth')?.enable();
    this.personalInfoForm.get('dateOfJoining')?.enable();
    this.personalInfoForm.get('manager')?.enable();
    this.personalInfoForm.get('employeeType')?.enable();
    this.personalInfoForm.get('address')?.enable();
  }

  private disableFormControls(): void {
    this.personalInfoForm.get('fullName')?.disable();
    this.personalInfoForm.get('email')?.disable();
    this.personalInfoForm.get('phone')?.disable();
    this.personalInfoForm.get('department')?.disable();
    this.personalInfoForm.get('jobTitle')?.disable();
    this.personalInfoForm.get('dateOfBirth')?.disable();
    this.personalInfoForm.get('dateOfJoining')?.disable();
    this.personalInfoForm.get('manager')?.disable();
    this.personalInfoForm.get('employeeType')?.disable();
    this.personalInfoForm.get('address')?.disable();
  }

  savePersonalInfo(): void {
    // Check for specific field validations
    const invalidFields = [];
    
    if (!this.personalInfoForm.get('fullName')?.value) {
      invalidFields.push('Full Name');
    }
    if (!this.personalInfoForm.get('email')?.value) {
      invalidFields.push('Email');
    } else if (this.personalInfoForm.get('email')?.errors?.['email']) {
      invalidFields.push('Valid Email');
    }
    if (!this.personalInfoForm.get('phone')?.value) {
      invalidFields.push('Phone');
    }
    if (!this.personalInfoForm.get('department')?.value) {
      invalidFields.push('Department');
    }
    if (!this.personalInfoForm.get('jobTitle')?.value) {
      invalidFields.push('Job Title');
    }
    if (!this.personalInfoForm.get('dateOfJoining')?.value) {
      invalidFields.push('Date of Joining');
    }

    if (invalidFields.length > 0) {
      this.snackBar.open(`Please fill in: ${invalidFields.join(', ')}`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // If all validations pass, proceed with save
    this.isLoading = true;
    const formData = this.personalInfoForm.value;

    // Check if we have an ID to determine if this is an update or create
    if (this.originalFormData && this.originalFormData.id) {
      // Ensure the ID is included in the form data
      formData.id = this.originalFormData.id;
      this.personalInfoService.updatePersonalInfo(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: this.handleSaveSuccess.bind(this),
          error: this.handleSaveError.bind(this)
        });
    } else {
      // No ID means this is a new record
      this.personalInfoService.savePersonalInfo(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: this.handleSaveSuccess.bind(this),
          error: this.handleSaveError.bind(this)
        });
    }
  }

  private handleSaveSuccess(response: any): void {
    this.isLoading = false;
    this.isEditMode = false;
    this.originalFormData = { ...response };
    this.personalInfoForm.patchValue(response);
    this.disableFormControls();
    
    this.snackBar.open('Personal information saved successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private handleSaveError(error: any): void {
    this.isLoading = false;
    this.snackBar.open(error.message || 'Error saving information', 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  quickSave(): void {
    this.savePersonalInfo();
  }

  cancelEdit(): void {
    this.personalInfoForm.patchValue(this.originalFormData);
    this.isEditMode = false;
    this.disableFormControls();
    this.snackBar.open('Changes cancelled.', 'Close', {
      duration: 2000
    });
  }
}