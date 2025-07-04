import {Component} from '@angular/core';
import {PatientMService} from '../service/patient-m.service';
import {GeographicLocation, Patient} from '../models/patient.model';
import {tap, catchError, of} from 'rxjs';
import {GeographicLocationService} from "../service/geographic_location.service";

@Component({
  selector: 'app-add-patient-m',
  templateUrl: './add-patient-m.component.html',
  styleUrls: ['./add-patient-m.component.scss']
})
export class AddPatientMComponent {

  public showPatientForm = true;
  public isLoading = false;
  public patientData: Patient | null = null;

  constructor(
    private patientService: PatientMService,
    private locationService: GeographicLocationService
  ) {
  }

  public createNewPatient(formData: Patient) {
    this.showLoading();
    this.patientService.registerPatient(formData).pipe(
      tap((resp: any) => {
        this.patientData = structuredClone(resp.data);
        this.showPatientForm = false;
        this.hideLoading();
      }),
      catchError(error => {
        console.error('Error al registrar el paciente:', error);
        this.hideLoading();
        return of(error);
      })
    ).subscribe();
  }

  public createLocation(locationData: GeographicLocation) {

    const patient_id = this.patientData === null ? -1 : this.patientData.id;

    if (patient_id === -1) return

    const dataWithPatientId: GeographicLocation = {...locationData, patient_id: patient_id};
    this.showLoading();

    this.locationService.registerLocation(dataWithPatientId).pipe(
      tap((resp: any) => {
        console.log('Registro exitoso de ubicación:', resp);
        setTimeout(() => {
          this.resetToPatientForm()
          this.hideLoading();
        }, 1000);
      }),
      catchError(error => {
        console.error('Error al registrar la ubicación:', error);
        this.hideLoading();
        return of(error);
      })
    ).subscribe();
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
