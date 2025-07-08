import { Component } from '@angular/core';
import {Mission} from "../models/mission.model";
import {MissionService} from "../services/mission.service";

@Component({
  selector: 'app-create-mission',
  templateUrl: './create-mission.component.html',
  styleUrls: ['./create-mission.component.scss']
})
export class CreateMissionComponent {
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  constructor(
    private missionService: MissionService
  ) {}

  onMissionSubmit(mission: Mission) {
    this.isLoading = true;

    this.missionService.registerMission(mission).subscribe({
      next: () => {
        this.isLoading = false;
        this.showNotification = true;
        this.notificationMessage = 'Misión creada exitosamente';
        this.notificationType = 'success';
      },
      error: (error) => {
        this.isLoading = false;
        this.showNotification = true;
        this.notificationMessage = error.error?.message || 'Error al crear la misión';
        this.notificationType = 'error';
      }
    });
  }

  onNotificationClose() {
    this.showNotification = false;
  }
}
