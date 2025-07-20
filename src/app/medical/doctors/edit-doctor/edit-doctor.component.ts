import {Component, OnInit} from '@angular/core';
import {DoctorService} from '../service/doctor.service';
import {ActivatedRoute} from '@angular/router';
import {Doctor, DoctorUpdateData, DoctorShowResponse} from "../models/doctor.model";
import {ApiResponse} from "../../../shared/models/global.model";

@Component({
  selector: 'app-edit-doctor',
  templateUrl: './edit-doctor.component.html',
  styleUrls: ['./edit-doctor.component.scss']
})
export class EditDoctorComponent implements OnInit {

  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  doctorId = '';
  doctorData: Doctor | null = null;

  constructor(
    private doctorService: DoctorService,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.doctorId = params.id;
      this.loadDoctor();
    });
  }

  private loadDoctor(): void {
    this.showLoading();

    this.doctorService.showDoctor(this.doctorId).subscribe({
      next: (resp: DoctorShowResponse) => {
        this.doctorData = resp.doctor;
        this.hideLoading();
      },
      error: () => {
        this.hideLoading();
        this.showError('Error al cargar los datos del doctor');
      }
    });
  }

  onDoctorUpdate(doctorData: DoctorUpdateData): void {
    this.showLoading();

    const formData = this.buildFormData(doctorData);

    this.doctorService.updateDoctor(this.doctorId, formData).subscribe({
      next: (resp: ApiResponse) => {
        this.hideLoading();

        if (resp.message === 403) {
          this.showError(resp.message_text || 'Error al actualizar el doctor');
          return;
        }

        this.showSuccess("El doctor ha sido actualizado correctamente");
        this.loadDoctor(); // Recargar datos actualizados
      },
      error: () => {
        this.hideLoading();
        this.showError('Error en el servidor');
      }
    });
  }

  onDoctorError(errorMessage: string): void {
    this.showWarning(errorMessage);
  }

  private buildFormData(data: DoctorUpdateData): FormData {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if (key === 'imagen' && value instanceof File) {
          formData.append('imagen', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return formData;
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
