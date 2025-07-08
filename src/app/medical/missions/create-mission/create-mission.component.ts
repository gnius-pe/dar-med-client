import { Component } from '@angular/core';
import {Mission} from "../models/mission.model";

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

  onMissionSubmit(mission: Mission) {
    this.isLoading = true;
    console.log('Mission to save:', mission);

    setTimeout(() => {
      this.isLoading = false;
      this.showNotification = true;
      this.notificationMessage = 'Misión creada exitosamente';
      this.notificationType = 'success';
    }, 1000);
  }

  onNotificationClose() {
    this.showNotification = false;
  }
}
