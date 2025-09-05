import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PersonalInfoDTO {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  dateOfBirth: Date;
  dateOfJoining: Date;
  manager: string;
  employeeType: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalInfoService {
  private apiUrl = 'http://localhost:8080/api/personal-info';

  constructor(private http: HttpClient) {
    console.log('PersonalInfoService initialized with API URL:', this.apiUrl);
  }

  // GET /api/personal-info
  getPersonalInfo(): Observable<PersonalInfoDTO> {
    const url = `${this.apiUrl}`;
    console.log('Making GET request to:', url);
    return this.http.get<PersonalInfoDTO>(url).pipe(
      catchError((error) => {
        console.error('GET request failed:', {
          url,
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        return this.handleError(error);
      })
    );
  }

  // POST /api/personal-info
  savePersonalInfo(personalInfo: PersonalInfoDTO): Observable<PersonalInfoDTO> {
    const url = `${this.apiUrl}`;
    console.log('Making POST request to:', url, 'with data:', personalInfo);
    return this.http.post<PersonalInfoDTO>(url, personalInfo).pipe(
      catchError((error) => {
        console.error('POST request failed:', {
          url,
          data: personalInfo,
          status: error.status,
          statusText: error.statusText,
          error: error.error
        });
        return this.handleError(error);
      })
    );
  }

  // PUT /api/personal-info
  updatePersonalInfo(personalInfo: PersonalInfoDTO): Observable<PersonalInfoDTO> {
    const url = `${this.apiUrl}`;
    console.log('Making PUT request to:', url, 'with data:', personalInfo);
    return this.http.put<PersonalInfoDTO>(url, personalInfo).pipe(
      catchError((error) => {
        console.error('PUT request failed:', {
          url,
          data: personalInfo,
          status: error.status,
          statusText: error.statusText,
          error: error.error
        });
        return this.handleError(error);
      })
    );
  }

  // DELETE /api/personal-info
  deletePersonalInfo(): Observable<any> {
    return this.http.delete(`${this.apiUrl}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 404:
          errorMessage = 'Personal information not found';
          break;
        case 400:
          errorMessage = `Error: ${error.error}`;
          break;
        case 500:
          errorMessage = 'Internal server error occurred. Please try again later';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.error}`;
      }
    }
    console.error('Error details:', error);
    return throwError(() => new Error(errorMessage));
  }
}
