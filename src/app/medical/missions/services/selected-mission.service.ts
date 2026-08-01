import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Mission } from '../models/mission.model';

@Injectable({
  providedIn: 'root'
})
export class SelectedMissionService {

  private readonly STORAGE_KEY = 'selected_mission';
  private selectedMissionSubject = new BehaviorSubject<Mission | null>(this.getSelectedMissionFromStorage());

  /**
   * Selecciona una misión y la guarda en sessionStorage
   */
  selectMission(mission: Mission | null): void {
    if (mission) {
      const normalizedMission = this.normalizeMission(mission);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalizedMission));
      this.selectedMissionSubject.next(normalizedMission);
      return;
    } else {
      sessionStorage.removeItem(this.STORAGE_KEY);
      this.selectedMissionSubject.next(null);
    }
  }

  /**
   * Obtiene la misión seleccionada como Observable
   */
  getSelectedMission$(): Observable<Mission | null> {
    return this.selectedMissionSubject.asObservable();
  }

  /**
   * Obtiene la misión seleccionada de forma síncrona
   */
  getSelectedMission(): Mission | null {
    return this.selectedMissionSubject.value;
  }

  /**
   * Deselecciona la misión actual
   */
  clearSelectedMission(): void {
    this.selectMission(null);
  }

  /**
   * Obtiene la misión seleccionada desde sessionStorage
   */
  private getSelectedMissionFromStorage(): Mission | null {
    try {
      const storedMission = sessionStorage.getItem(this.STORAGE_KEY);
      return storedMission ? this.normalizeMission(JSON.parse(storedMission) as Mission) : null;
    } catch (error) {
      console.error('Error parsing selected mission from sessionStorage:', error);
      return null;
    }
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
