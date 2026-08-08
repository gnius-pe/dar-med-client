import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Mission } from '../models/mission.model';
import { MissionService } from '../services/mission.service';
import { SelectedMissionService } from '../services/selected-mission.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-missions',
  templateUrl: './list-missions.component.html',
  styleUrls: ['./list-missions.component.scss']
})
export class ListMissionsComponent implements OnInit, OnDestroy {
  missionsList: Mission[] = [];
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: NotificationType = 'success';
  selectedMission: Mission | null = null;
  user: AuthUser | null = null;

  private destroy$ = new Subject<void>();
  private selectedMissionSubscription!: Subscription;

  constructor(
    private missionService: MissionService,
    private selectedMissionService: SelectedMissionService,
    private router: Router
  ) {
    this.loadUser();
  }

  ngOnInit(): void {
    this.subscribeToSelectedMission();
    this.listMissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.selectedMissionSubscription.unsubscribe();
  }

  listMissions(): void {
    this.showLoading();

    this.missionService.listMissions().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.missionsList = response;
        this.hideLoading();
      },
      error: (error) => {
        this.hideLoading();
        this.showError(error.message ?? 'Error al cargar las misiones');
      }
    });
  }

  editMission(mission: Mission): void {
    if (!mission.id) {
      this.showError('No se pudo editar la misión seleccionada');
      return;
    }

    this.router.navigate(['/missions/edit-mission', mission.id]);
  }

  deleteMission(_mission: Mission): void {
    // TODO: Implementar eliminación
  }

  selectMission(mission: Mission): void {
    if (!this.isSuperAdmin()) {
      this.showWarning('Solo el Super Administrador puede seleccionar una misión');
      return;
    }

    if (!mission.state) {
      this.showWarning('Solo puedes seleccionar una misión activa');
      return;
    }

    this.selectedMissionService.selectMission(mission);
    this.showSuccess(`Misión "${mission.name}" seleccionada correctamente`);
  }

  isActiveMission(mission: Mission): boolean {
    return mission.state;
  }

  isSelectedMission(mission: Mission): boolean {
    return !!this.selectedMission?.id && this.selectedMission.id === mission.id && !!mission.state;
  }

  isSuperAdmin(): boolean {
    return this.user?.roles.includes('Super-Admin') ?? false;
  }

  showSuccess(message: string): void {
    this.showNotificationMessage(message, 'success');
  }

  showError(message: string): void {
    this.showNotificationMessage(message, 'error');
  }

  showWarning(message: string): void {
    this.showNotificationMessage(message, 'warning');
  }

  onNotificationClose(): void {
    this.showNotification = false;
  }

  private subscribeToSelectedMission(): void {
    this.selectedMissionSubscription = this.selectedMissionService
      .getSelectedMission$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mission) => {
        this.selectedMission = mission;
      });
  }

  private showNotificationMessage(message: string, type: NotificationType): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
  }

  private loadUser(): void {
    const userStorage = localStorage.getItem('user');
    this.user = userStorage ? JSON.parse(userStorage) : null;
  }

  private showLoading(): void {
    this.isLoading = true;
  }

  private hideLoading(): void {
    this.isLoading = false;
  }
}

type NotificationType = 'success' | 'error' | 'warning';

interface AuthUser {
  name: string;
  roles: string[];
  permissions: string[];
  [key: string]: any;
}
