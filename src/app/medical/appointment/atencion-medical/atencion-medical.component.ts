import {Component, OnInit} from '@angular/core';
import {AppointmentService} from '../service/appointment.service';
import {ActivatedRoute} from '@angular/router';

interface Medication {
  name_medical: string;
  uso: string;
}

interface AppointmentData {
  id: number;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    identification_number: string;
    first_phone: string;
  };
  patient_id: number;
}

interface AttentionData {
  description: string;
  receta_medica: Medication[];
}

@Component({
  selector: 'app-atencion-medical',
  templateUrl: './atencion-medical.component.html',
  styleUrls: ['./atencion-medical.component.scss']
})
export class AtencionMedicalComponent implements OnInit {

  // Patient data (readonly)
  first_name = '';
  last_name = '';
  identification_number = '';
  first_phone = '';

  // Form data
  description = '';
  name_medical = '';
  uso = '';
  medical: Medication[] = [];

  // UI state
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  // Data
  public appointmentId = '';
  public appointmentData: AppointmentData | null = null;
  public attentionData: AttentionData | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.appointmentId = params.id;
      this.loadData();
    });
  }

  private loadData(): void {
    this.showLoading();
    this.loadAppointment();
  }

  private loadAppointment(): void {
    this.appointmentService.showAppointment(this.appointmentId).subscribe({
      next: (resp: any) => {

        this.appointmentData = resp.appointment;

        if (this.appointmentData?.patient) {
          this.first_name = this.appointmentData.patient.first_name;
          this.last_name = this.appointmentData.patient.last_name;
          this.first_phone = this.appointmentData.patient.first_phone;
          this.identification_number = this.appointmentData.patient.identification_number;
        }

        this.loadAttention();
      },
      error: () => {
        this.hideLoading();
        this.showError('Error al cargar los datos de la cita');
      }
    });
  }

  private loadAttention(): void {
    this.appointmentService.showAppointment(this.appointmentId).subscribe({
      next: (resp: any) => {
        this.hideLoading();

        if (resp.appointment_attention) {
          this.attentionData = resp.appointment_attention;
          this.description = this.attentionData?.description || '';
          this.medical = this.attentionData?.receta_medica || [];
        }
      },
      error: () => {
        this.hideLoading();
        this.medical = [];
        this.description = '';
      }
    });
  }

  addMedicament(): void {
    if (!this.name_medical || !this.uso) {
      this.showWarning('Complete el nombre del medicamento y su uso');
      return;
    }

    this.medical.push({
      name_medical: this.name_medical,
      uso: this.uso,
    });

    // Clear form
    this.name_medical = '';
    this.uso = '';
  }

  deleteMedical(index: number): void {
    this.medical.splice(index, 1);
  }

  save(): void {
    if (!this.description || this.medical.length === 0) {
      this.showWarning('Es necesario ingresar el diagnóstico y al menos un medicamento');
      return;
    }

    if (!this.appointmentData) {
      this.showError('No se encontraron datos de la cita');
      return;
    }

    this.showLoading();

    const data = {
      appointment_id: this.appointmentId,
      patient_id: this.appointmentData.patient.id,
      description: this.description,
      medical: this.medical,
    };

    this.appointmentService.registerAttention(data).subscribe({
      next: (resp: any) => {
        this.hideLoading();

        if (resp.message === 200) {
          this.showSuccess('Se guardó la información de la atención médica exitosamente');
        } else {
          this.showError('Error al guardar la atención médica');
        }
      },
      error: () => {
        this.hideLoading();
        this.showError('Error en el servidor al guardar la atención');
      }
    });
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
