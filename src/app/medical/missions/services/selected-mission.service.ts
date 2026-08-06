import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Mission } from '../models/mission.model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class SelectedMissionService {

  private readonly STORAGE_KEY = 'selected_mission';
  private selectedMissionSubject = new BehaviorSubject<Mission | null>(this.getSelectedMissionFromStorage());

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadFromBackend();
  }

  private loadFromBackend(): void {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/settings/selected-mission";
    this.http.get<any>(URL, {headers}).subscribe({
      next: (response) => {
        const currentMission = this.selectedMissionSubject.value;
        if (currentMission) {
          return;
        }
        const mission = response.selected_mission ? this.normalizeMission(response.selected_mission) : null;
        this.selectedMissionSubject.next(mission);
        this.saveToStorage(mission);
      },
      error: () => {
        const currentMission = this.selectedMissionSubject.value;
        if (currentMission) {
          return;
        }
        const local = this.getSelectedMissionFromStorage();
        this.selectedMissionSubject.next(local);
      }
    });
  }

  selectMission(mission: Mission | null): void {
    if (mission) {
      const normalizedMission = this.normalizeMission(mission);
      this.selectedMissionSubject.next(normalizedMission);
      this.saveToStorage(normalizedMission);
      this.persistToBackend(normalizedMission);
      return;
    } else {
      this.selectedMissionSubject.next(null);
      this.removeFromStorage();
      this.deleteFromBackend();
    }
  }

  getSelectedMission$(): Observable<Mission | null> {
    return this.selectedMissionSubject.asObservable();
  }

  getSelectedMission(): Mission | null {
    return this.selectedMissionSubject.value;
  }

  clearSelectedMission(): void {
    this.selectMission(null);
  }

  private persistToBackend(mission: Mission): void {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/settings/selected-mission";
    this.http.post(URL, {selected_mission: mission}, {headers}).subscribe({
      next: () => {
        this.saveToStorage(mission);
      },
      error: () => {
        this.saveToStorage(mission);
      }
    });
  }

  private deleteFromBackend(): void {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/settings/selected-mission";
    this.http.delete(URL, {headers}).subscribe({
      next: () => {
        this.removeFromStorage();
      },
      error: () => {
        this.removeFromStorage();
      }
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
    } catch (error) {
      console.error('Error parsing selected mission from storage:', error);
      return null;
    }
  }

  private saveToStorage(mission: Mission | null): void {
    if (!mission) {
      this.removeFromStorage();
      return;
    }

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
      state: this.normalizeState(mission.state),
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
