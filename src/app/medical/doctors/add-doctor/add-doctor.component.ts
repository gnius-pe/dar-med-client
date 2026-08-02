import {Component} from '@angular/core';
import {DoctorService} from '../service/doctor.service';
import { DoctorCreateData} from "../models/doctor.model";
import {ApiResponse} from "../../../shared/models/global.model";

@Component({
  selector: 'app-add-doctor',
  templateUrl: './add-doctor.component.html',
  styleUrls: ['./add-doctor.component.scss']
})
export class AddDoctorComponent {

  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  constructor(
    private doctorService: DoctorService,
  ) {
  }

  onDoctorSave(doctorData: DoctorCreateData): void {
    this.showLoading();


    const formData = this.buildFormData(doctorData);

    this.doctorService.registerDoctor(formData).subscribe({
      next: (resp: ApiResponse) => {
        this.hideLoading();

        if (resp.message === 403) {
          this.showError(resp.message_text || 'Error al registrar el doctor');
          return
        }

        this.showSuccess("El doctor ha sido registrado correctamente");
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

  private buildFormData(data: DoctorCreateData): FormData {
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
