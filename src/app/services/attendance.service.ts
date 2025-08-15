import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AttendanceRecord {
  id: string;
  checkInDate: Date;
  checkInTime: string;
  checkOutDate: Date;
  checkOutTime: string;
}

export interface SearchCriteria {
  startDate: Date | null;
  endDate: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private attendanceRecords: AttendanceRecord[] = [];    // store array of attendance records objects
  private attendanceSubject = new BehaviorSubject<AttendanceRecord[]>([]);

  constructor() {
    // Initialize with some sample data
    this.loadSampleData();
  }

  private loadSampleData(): void {
    const sampleData: AttendanceRecord[] = [
      {
        id: '1',
        checkInDate: new Date('2025-08-1'),
        checkInTime: '08:00',
        checkOutDate: new Date('2025-08-1'),
        checkOutTime: '17:00'
      },
      {
        id: '2',
        checkInDate: new Date('2025-08-2'),
        checkInTime: '08:30',
        checkOutDate: new Date('2025-08-2'),
        checkOutTime: '17:30'
      },
      {
        id: '3',
        checkInDate: new Date('2025-08-3'),
        checkInTime: '09:15',
        checkOutDate: new Date('2025-08-3'),
        checkOutTime: '16:45'
      }
    ];
    this.attendanceRecords = sampleData;
    this.attendanceSubject.next([...this.attendanceRecords]);
  }

  getAttendanceRecords(): Observable<AttendanceRecord[]> {
    return this.attendanceSubject.asObservable();
  }

  searchAttendanceRecords(criteria: SearchCriteria): Observable<AttendanceRecord[]> {
    let filteredRecords = [...this.attendanceRecords];

    if (criteria.startDate) {
      filteredRecords = filteredRecords.filter(record => 
        record.checkInDate >= criteria.startDate!
      );
    }

    if (criteria.endDate) {
      filteredRecords = filteredRecords.filter(record => 
        record.checkInDate <= criteria.endDate!
      );
    }

    return new Observable(observer => {
      observer.next(filteredRecords);
      observer.complete();
    });
  }

  addAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): void {
    const newRecord: AttendanceRecord = {
      ...record,
      id: this.generateId()
    };
    this.attendanceRecords.push(newRecord);
    this.attendanceSubject.next([...this.attendanceRecords]);
  }

  updateAttendanceRecord(id: string, record: Omit<AttendanceRecord, 'id'>): void {
    const index = this.attendanceRecords.findIndex(r => r.id === id);
    if (index !== -1) {
      this.attendanceRecords[index] = { ...record, id };
      this.attendanceSubject.next([...this.attendanceRecords]);
    }
  }

  deleteAttendanceRecord(id: string): void {
    this.attendanceRecords = this.attendanceRecords.filter(r => r.id !== id);
    this.attendanceSubject.next([...this.attendanceRecords]);
  }

  getAttendanceRecordById(id: string): AttendanceRecord | undefined {
    return this.attendanceRecords.find(r => r.id === id);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
