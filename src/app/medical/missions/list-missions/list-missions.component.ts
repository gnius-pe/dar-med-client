import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Mission} from "../models/mission.model";
import {MissionService} from "../services/mission.service";
import {SelectedMissionService} from "../services/selected-mission.service";
import {Subscription} from "rxjs";

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
  notificationType: 'success' | 'error' | 'warning' = 'success';
  selectedMission: Mission | null = null;
  user: any = null;
  private selectedMissionSubscription: Subscription = new Subscription();

  constructor(
    private missionService: MissionService,
    private selectedMissionService: SelectedMissionService,
    private router: Router,
  ) {
    const USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;
  }

  ngOnInit(): void {
    this.selectedMissionSubscription = this.selectedMissionService.getSelectedMission$().subscribe((mission) => {
      this.selectedMission = mission;
    });

    this.listMissions();
  }

  ngOnDestroy(): void {
    this.selectedMissionSubscription.unsubscribe();
  }

  listMissions() {
    this.showLoading()
    this.missionService.listMissions().subscribe({
      next: (response) => {
        this.missionsList = response;
        this.hideLoading()
      },
      error: (error) => {
       this.hideLoading()
        this.showError(error.message)
      }
    });
  }

  editMission(mission: Mission) {
    if (!mission.id) {
      this.showError('No se pudo editar la misión seleccionada');
      return;
    }

    this.router.navigate(['/missions/edit-mission', mission.id]);
  }

  deleteMission(mission: Mission) {
    // TODO: Implementar eliminación
  }

  selectMission(mission: Mission) {
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
    return this.user && this.user.roles && this.user.roles.includes('Super-Admin');
  }

  showSuccess(message: string) {
    this.notificationMessage = message;
    this.notificationType = 'success';
    this.showNotification = true;
  }

  showError(message: string) {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;
  }

  showWarning(message: string) {
    this.notificationMessage = message;
    this.notificationType = 'warning';
    this.showNotification = true;
  }

  onNotificationClose() {
    this.showNotification = false;
  }

  private showLoading() {
    this.isLoading = true;
  }

  private hideLoading() {
    this.isLoading = false;
  }
}
