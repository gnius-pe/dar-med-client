import {Component} from '@angular/core';
import {PatientMService} from '../service/patient-m.service';
import {GeographicLocation, Patient} from '../models/patient.model';
import {tap, catchError, of} from 'rxjs';
import {GeographicLocationService} from "../service/geographic_location.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-add-patient-m',
  templateUrl: './add-patient-m.component.html',
  styleUrls: ['./add-patient-m.component.scss'],
})
export class AddPatientMComponent {

  showPatientForm = true;
  patientData: Patient | null = null;

  isLoading = false;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  showConfirmModal = false;
  modalMessage = '';

  constructor(
    private patientService: PatientMService,
    private locationService: GeographicLocationService,
    private router: Router,
  ) {
  }

  public createNewPatient(formData: Patient) {
    this.showLoading();
    this.patientService.registerPatient(formData).pipe(
      tap((resp: any) => {
        this.patientData = structuredClone(resp.data);
        this.showPatientForm = false;
        this.hideLoading();
        this.showSuccess('Paciente registrado con éxito');
      }),
      catchError(error => {

        this.hideLoading();

        if (error.status === 422) {
          this.showError(error.error.message);
        } else {
          this.showError('Error al registrar el paciente');
        }

        return of(error);
      })
    ).subscribe();
  }

  getCreateAppointmentRoute(): string[] {
    if (this.patientData?.identification_number) {
      return ['/appointment-m/register', this.patientData.identification_number];
    }
    return ['/appointment-m/register'];
  }

  public createLocation(locationData: GeographicLocation) {

    const patient_id = this.patientData === null ? -1 : this.patientData.id;

    if (patient_id === -1) return

    const dataWithPatientId: GeographicLocation = {...locationData, patient_id: patient_id};
    this.showLoading();

    this.locationService.registerLocation(dataWithPatientId).pipe(
      tap(() => {
        setTimeout(() => {
          this.hideLoading();
          this.showModal()
        }, 0);
      }),
      catchError(error => {
        this.hideLoading();
        return of(error);
      })
    ).subscribe();
  }

  private showModal() {
    this.modalMessage = '¿Desea crear cita?';
    this.showConfirmModal = true;
  }

  onModalAccept() {
    this.makeShowModalFalse()
    const route = this.getCreateAppointmentRoute();
    this.router.navigate(route);
  }

  onModalCancel() {
    this.makeShowModalFalse()
    this.resetToPatientForm()
  }

  private makeShowModalFalse() {
    this.showConfirmModal = false;
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

  private resetToPatientForm(): void {
    this.patientData = null;
    this.showPatientForm = true;
  }
}
