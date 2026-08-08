import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Mission } from '../models/mission.model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { URL_SERVICIOS } from 'src/app/config/config';

interface SelectedMissionResponse {
  selected_mission?: Mission;
}

@Injectable({
  providedIn: 'root'
})
export class SelectedMissionService {
  private readonly STORAGE_KEY = 'selected_mission';
  private selectedMissionSubject = new BehaviorSubject<Mission | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadFromBackend();
  }

  getSelectedMission$(): Observable<Mission | null> {
    return this.selectedMissionSubject.asObservable();
  }

  getSelectedMission(): Mission | null {
    return this.selectedMissionSubject.value;
  }

  selectMission(mission: Mission | null): void {
    if (mission) {
      const normalizedMission = this.normalizeMission(mission);
      this.selectedMissionSubject.next(normalizedMission);
      this.saveToStorage(normalizedMission);
      this.persistToBackend(normalizedMission);
      return;
    }

    this.selectedMissionSubject.next(null);
    this.removeFromStorage();
    this.deleteFromBackend();
  }

  clearSelectedMission(): void {
    this.selectMission(null);
  }

  private loadFromBackend(): void {
    const headers = this.getAuthHeaders();
    const url = `${URL_SERVICIOS}/settings/selected-mission`;

    this.http.get<SelectedMissionResponse>(url, { headers }).pipe(
      map((response) => {
        if (this.selectedMissionSubject.value !== null) {
          return null;
        }

        return response.selected_mission ? this.normalizeMission(response.selected_mission) : null;
      }),
      catchError(() => {
        if (this.selectedMissionSubject.value !== null) {
          return of(null);
        }

        return of(this.getSelectedMissionFromStorage());
      })
    ).subscribe((mission) => {
      if (mission) {
        this.selectedMissionSubject.next(mission);
      }
    });
  }

  private persistToBackend(mission: Mission): void {
    const headers = this.getAuthHeaders();
    const url = `${URL_SERVICIOS}/settings/selected-mission`;

    this.http.post<SelectedMissionResponse>(url, { selected_mission: mission }, { headers }).pipe(
      catchError(() => {
        this.selectedMissionSubject.next(mission);
        return throwError(() => new Error('Failed to persist selected mission'));
      })
    ).subscribe();
  }

  private deleteFromBackend(): void {
    const headers = this.getAuthHeaders();
    const url = `${URL_SERVICIOS}/settings/selected-mission`;

    this.http.delete(url, { headers }).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to delete selected mission'));
      })
    ).subscribe();
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.token}`
    });
  }

  private getSelectedMissionFromStorage(): Mission | null {
    try {
      const storedMission = localStorage.getItem(this.STORAGE_KEY);
      if (storedMission) {
        return this.normalizeMission(JSON.parse(storedMission) as Mission);
      }

      const sessionStored = sessionStorage.getItem(this.STORAGE_KEY);
      return sessionStored ? this.normalizeMission(JSON.parse(sessionStored) as Mission) : null;
    } catch {
      console.error('Error parsing selected mission from storage');
      return null;
    }
  }

  private saveToStorage(mission: Mission): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mission));
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(mission));
  }

  private removeFromStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  private normalizeMission(mission: Mission): Mission {
    return {
      ...mission,
      state: this.normalizeState(mission.state)
    };
  }

  private normalizeState(state: boolean | number | string | null | undefined): boolean {
    if (state === null || state === undefined || state === '') {
      return false;
    }

    if (typeof state === 'boolean') {
      return state;
    }

    return state === 1 || state === '1' || state === 'true';
  }
}
