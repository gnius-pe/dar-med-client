import {Component, ElementRef, ViewChild} from '@angular/core';
import {AppointmentService} from '../service/appointment.service';
import {ApiResponse} from "../../../shared/models/global.model";
import {AppointmentCreateData} from "../models/appointment.model";
import {PrintService} from "../../../shared/services/print.service";

@Component({
  selector: 'app-add-appointments',
  templateUrl: './add-appointments.component.html',
  styleUrls: ['./add-appointments.component.scss']
})
export class AddAppointmentsComponent {

  @ViewChild('qrCodeContainer', {static: false}) qrCodeContainer!: ElementRef;

  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  showConfirmModal = false;
  modalMessage = '';

  patientId = '';

  constructor(
    private appointmentService: AppointmentService,
    private printService: PrintService,
  ) {
  }

  onAppointmentSave(appointmentsData: AppointmentCreateData[]): void {
    this.showLoading();
    this.createAppointmentsSequentially(appointmentsData, 0);
  }

  private createAppointmentsSequentially(appointmentsData: AppointmentCreateData[], index: number): void {
    if (index >= appointmentsData.length) {
      this.hideLoading();
      this.showSuccess("Las citas médicas se registraron exitosamente");
      this.modalMessage = '¿Desea imprimir las citas?';
      this.showConfirmModal = true;
      return;
    }

    const appointmentData = appointmentsData[index];
    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (resp: ApiResponse) => {
        if (resp.message === 422) {
          this.hideLoading();
          this.showError(resp.message_text || 'Error al crear una de las citas');
          return;
        }

        if (resp.message === 403) {
          this.hideLoading();
          this.showError(resp.message_text || 'No tienes permisos para crear citas');
          return;
        }

        this.patientId = appointmentData.patient_id?.toString() || '';
        this.createAppointmentsSequentially(appointmentsData, index + 1);
      },
      error: () => {
        this.hideLoading();
        this.showError('Error en el servidor al crear la cita');
      }
    });
  }

  private resetPatientId(): void {
    this.patientId = ''
  }

  onModalAccept(): void {
    this.showConfirmModal = false;

    if (this.patientId === '') return

    const qrCodeElement = this.qrCodeContainer?.nativeElement?.querySelector('canvas');
    this.printService.printPatientData(this.patientId, qrCodeElement).subscribe();

    this.resetPatientId()
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
