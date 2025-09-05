import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError, of, map } from 'rxjs';

export interface AttendanceRecord {
  id: string;
  checkInDate: Date;
  checkInTime: string;
  checkOutTime: string | null;
}

export interface SearchCriteria {
  startDate: Date | null;
  endDate: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:8080/api/attendance';
  private attendanceRecords: AttendanceRecord[] = [];
  private attendanceSubject = new BehaviorSubject<AttendanceRecord[]>([]);

  constructor(private http: HttpClient) {
    this.loadAttendanceRecords();
  }

  private loadAttendanceRecords(): void {
    this.http.get<AttendanceRecord[]>(this.apiUrl)
      .pipe(
        tap(response => {
          if (!Array.isArray(response)) {
            throw new Error('Invalid response format: expected an array');
          }
        }),
        catchError(this.handleError.bind(this))
      )
      .subscribe({
        next: (records) => {
          try {
            this.attendanceRecords = records.map(record => {
              if (record.checkInDate) {
                // Parse the date string correctly preserving the actual date
                const [year, month, day] = String(record.checkInDate).split('-').map(Number);
                return {
                  ...record,
                  checkInDate: new Date(year, month - 1, day, 0, 0, 0, 0)
                };
              } else {
                // If no date, use current date at midnight in local timezone
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return {
                  ...record,
                  checkInDate: today
                };
              }
            });
            this.attendanceSubject.next([...this.attendanceRecords]);
          } catch (error) {
            console.error('Error processing records:', error);
            this.handleError(new HttpErrorResponse({
              error: error,
              status: 0,
              statusText: 'Data Processing Error'
            }));
          }
        },
        error: (error) => {
          console.error('Error loading records:', error);
          this.attendanceSubject.next([]);
        }
      });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Network error or CORS issue
      errorMessage = 'Please check your network connection and try again';
    } else if (error.status === 200 && error.statusText === 'OK' && error.message.includes('Http failure during parsing')) {
      // JSON parse error
      errorMessage = 'Invalid data received from server. Please try again or contact support.';
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.statusText || error.message}`;
    }
    console.error('Full error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getAttendanceRecords(): Observable<AttendanceRecord[]> {
    return this.attendanceSubject.asObservable();
  }

  searchAttendanceRecords(criteria: SearchCriteria): Observable<AttendanceRecord[]> {
    let filteredRecords = [...this.attendanceRecords];

    if (criteria.startDate) {
      const startDate = new Date(criteria.startDate);
      startDate.setHours(0, 0, 0, 0);
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.checkInDate);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate >= startDate;
      });
    }

    if (criteria.endDate) {
      const endDate = new Date(criteria.endDate);
      endDate.setHours(23, 59, 59, 999);
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.checkInDate);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate <= endDate;
      });
    }

    return new Observable(observer => {
      observer.next(filteredRecords);
      observer.complete();
    });
  }

  addAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Observable<AttendanceRecord> {
    // Create a new date from the input
    const inputDate = record.checkInDate instanceof Date 
      ? new Date(record.checkInDate) 
      : new Date(record.checkInDate);

    // Format date in YYYY-MM-DD without timezone adjustment
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    const recordToSend = {
      ...record,
      checkInDate: formattedDate
    };

    return this.http.post<AttendanceRecord>(`${this.apiUrl}/save`, recordToSend)
      .pipe(
        tap(newRecord => {
          // Parse the response date preserving the actual date
          const [respYear, respMonth, respDay] = String(newRecord.checkInDate).split('-').map(Number);
          const recordWithDate = {
            ...newRecord,
            checkInDate: new Date(respYear, respMonth - 1, respDay, 0, 0, 0, 0)
          };
          this.attendanceRecords.push(recordWithDate);
          this.attendanceSubject.next([...this.attendanceRecords]);
        }),
        catchError(this.handleError)
      );
  }

  updateAttendanceRecord(id: string, record: Omit<AttendanceRecord, 'id'>): Observable<AttendanceRecord> {
    // Create a new date from the input
    const inputDate = record.checkInDate instanceof Date 
      ? new Date(record.checkInDate) 
      : new Date(record.checkInDate);

    // Convert to UTC date string in YYYY-MM-DD format
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // Create the record to send
    const formattedRecord = {
      ...record,
      checkInDate: formattedDate
    };

    return this.http.put<AttendanceRecord>(`${this.apiUrl}/${id}`, formattedRecord)
      .pipe(
        tap(updatedRecord => {
          // Parse the response date preserving the actual date
          const [respYear, respMonth, respDay] = String(updatedRecord.checkInDate).split('-').map(Number);
          const recordWithDate = {
            ...updatedRecord,
            checkInDate: new Date(respYear, respMonth - 1, respDay, 0, 0, 0, 0)
          };
          const index = this.attendanceRecords.findIndex(r => r.id === id);
          if (index !== -1) {
            this.attendanceRecords[index] = recordWithDate;
            this.attendanceSubject.next([...this.attendanceRecords]);
          }
        }),
        catchError(this.handleError)
      );
  }

  deleteAttendanceRecord(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' })
      .pipe(
        map(() => ({ success: true })), // Convert successful empty response to a success object
        tap(() => {
          // Update local state after successful deletion
          this.attendanceRecords = this.attendanceRecords.filter(r => r.id !== id);
          this.attendanceSubject.next([...this.attendanceRecords]);
        }),
        catchError((error: HttpErrorResponse) => {
          // Handle successful deletion with empty response
          if (error.status === 200 || error.status === 204) {
            this.attendanceRecords = this.attendanceRecords.filter(r => r.id !== id);
            this.attendanceSubject.next([...this.attendanceRecords]);
            return of({ success: true });
          }
          // Handle not found case
          if (error.status === 404) {
            this.attendanceRecords = this.attendanceRecords.filter(r => r.id !== id);
            this.attendanceSubject.next([...this.attendanceRecords]);
            return of({ success: true });
          }
          // For real errors
          return this.handleError(error);
        })
      );
  }

  getAttendanceRecordById(id: string): Observable<AttendanceRecord> {
    return this.http.get<AttendanceRecord>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(record => {
          record.checkInDate = new Date(record.checkInDate);
        }),
        catchError(this.handleError)
      );
  }
}
