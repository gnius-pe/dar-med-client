import {Component, OnInit} from '@angular/core';
import {Mission} from "../models/mission.model";
import {MissionService} from "../services/mission.service";

@Component({
  selector: 'app-list-missions',
  templateUrl: './list-missions.component.html',
  styleUrls: ['./list-missions.component.scss']
})
export class ListMissionsComponent implements OnInit {

  missionsList: Mission[] = [];
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  constructor(
    private missionService: MissionService
  ) {
  }

  ngOnInit(): void {
    this.listMissions();
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
    // TODO: Implementar edición
  }

  deleteMission(mission: Mission) {
    // TODO: Implementar eliminación
  }

  selectMission(mission: Mission) {
    // TODO: Implementar selección
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
