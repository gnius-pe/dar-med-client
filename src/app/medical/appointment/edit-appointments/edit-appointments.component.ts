import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../service/appointment.service';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from "../../../shared/models/global.model";
import {Appointment, AppointmentUpdateData} from "../models/appointment.model";

@Component({
  selector: 'app-edit-appointments',
  templateUrl: './edit-appointments.component.html',
  styleUrls: ['./edit-appointments.component.scss']
})
export class EditAppointmentsComponent implements OnInit {

  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  public appointmentId = '';
  public appointmentData: Appointment | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.appointmentId = params.id;
      this.loadAppointment();
    });
  }

  private loadAppointment(): void {
    this.showLoading();

    this.appointmentService.showAppointment(this.appointmentId).subscribe({
      next: (resp: any) => {
        this.appointmentData = resp.appointment;
        this.hideLoading();
      },
      error: () => {
        this.hideLoading();
        this.showError('Error al cargar los datos de la cita');
      }
    });
  }

  onAppointmentUpdate(appointmentData: AppointmentUpdateData): void {
    this.showLoading();

    this.appointmentService.updateAppointment(this.appointmentId, appointmentData).subscribe({
      next: (resp: ApiResponse) => {
        this.hideLoading();

        if (resp.message === 422) {
          this.showError(resp.message_text || 'Error al actualizar la cita');
          return;
        }

        if (resp.message === 403) {
          this.showError(resp.message_text || 'No tienes permisos para editar esta cita');
          return;
        }

        this.showSuccess("La cita médica ha sido actualizada correctamente");
        this.loadAppointment(); // Recargar datos actualizados
      },
      error: () => {
        this.hideLoading();
        this.showError('Error en el servidor al actualizar la cita');
      }
    });
  }

  onAppointmentError(errorMessage: string): void {
    this.showWarning(errorMessage);
  }

  private showLoading(): void {
    this.isLoading = true;
  }

  private hideLoading(): void {
    this.isLoading = false;
  }

  showSuccess(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'success';
    this.showNotification = true;
  }

  showError(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;
  }

  showWarning(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'warning';
    this.showNotification = true;
  }

  onNotificationClose(): void {
    this.showNotification = false;
  }
}
