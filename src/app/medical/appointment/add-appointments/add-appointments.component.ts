import { Component } from '@angular/core';
import { AppointmentService } from '../service/appointment.service';
import { ApiResponse } from "../../../shared/models/global.model";
import {AppointmentCreateData} from "../models/appointment.model";

@Component({
  selector: 'app-add-appointments',
  templateUrl: './add-appointments.component.html',
  styleUrls: ['./add-appointments.component.scss']
})
export class AddAppointmentsComponent {

  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  showConfirmModal = false;
  modalMessage = '';

  constructor(
    private appointmentService: AppointmentService
  ) {}

  onAppointmentSave(appointmentData: AppointmentCreateData): void {
    this.showLoading();

    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (resp: ApiResponse) => {
        this.hideLoading();

        if (resp.message === 422) {
          this.showError(resp.message_text || 'Error al crear la cita');
          return;
        }

        if (resp.message === 403) {
          this.showError(resp.message_text || 'No tienes permisos para crear citas');
          return;
        }

        this.showSuccess("La cita médica se registró exitosamente");

        this.modalMessage = '¿Desea imprimir la cita?';
        this.showConfirmModal = true;
      },
      error: () => {
        this.hideLoading();
        this.showError('Error en el servidor al crear la cita');
      }
    });
  }

  onModalAccept(): void {
    this.showConfirmModal = false;
    console.log('Imprimir cita confirmado');
  }

  onModalCancel(): void {
    this.showConfirmModal = false;
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
