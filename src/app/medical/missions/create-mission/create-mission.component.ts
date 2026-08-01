import { Component, OnInit } from '@angular/core';
import {Mission} from "../models/mission.model";
import {MissionService} from "../services/mission.service";
import {SelectedMissionService} from "../services/selected-mission.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-create-mission',
  templateUrl: './create-mission.component.html',
  styleUrls: ['./create-mission.component.scss']
})
export class CreateMissionComponent implements OnInit {
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';
  missionData: Mission | null = null;
  submitLabel = 'Guardar';
  missionId: string | null = null;

  constructor(
    private missionService: MissionService,
    private selectedMissionService: SelectedMissionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.missionId = this.route.snapshot.paramMap.get('id');

    if (this.missionId) {
      this.submitLabel = 'Actualizar';
      this.loadMission(this.missionId);
    }
  }

  private loadMission(missionId: string): void {
    this.isLoading = true;

    this.missionService.showMission(missionId).subscribe({
      next: (mission: Mission) => {
        this.missionData = mission;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.showNotification = true;
        this.notificationMessage = error.error?.message || 'Error al cargar la misión';
        this.notificationType = 'error';
      }
    });
  }

  onMissionSubmit(mission: Mission) {
    this.isLoading = true;

    const request$ = this.missionId
      ? this.missionService.updateMission(this.missionId, mission)
      : this.missionService.registerMission(mission);

    request$.subscribe({
      next: (savedMission: Mission) => {
        if (savedMission.state) {
          this.selectedMissionService.selectMission(savedMission);
        } else if (this.missionId) {
          this.selectedMissionService.clearSelectedMission();
        }

        this.isLoading = false;
        this.showNotification = true;
        this.notificationMessage = this.missionId ? 'Misión actualizada exitosamente' : 'Misión creada exitosamente';
        this.notificationType = 'success';

        if (this.missionId) {
          this.router.navigate(['/missions/list-missions']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showNotification = true;
        this.notificationMessage = error.error?.message || (this.missionId ? 'Error al actualizar la misión' : 'Error al crear la misión');
        this.notificationType = 'error';
      }
    });
  }

  onNotificationClose() {
    this.showNotification = false;
  }
}
