import {Component} from '@angular/core';
import {PatientMService} from '../service/patient-m.service';
import {FormBuilder, FormGroup} from "@angular/forms";
import {Validators} from "ngx-editor";
import {catchError, of, tap} from "rxjs";
import {Patient} from "../models/patient.model";

@Component({
  selector: 'app-add-patient-m',
  templateUrl: './add-patient-m.component.html',
  styleUrls: ['./add-patient-m.component.scss']
})

export class AddPatientMComponent {


  constructor(
    private patientService: PatientMService,
  ) {
  }


  public createNewPatient(formData: Patient) {
    this.patientService.registerPatient(formData).pipe(
      tap((resp: any) => console.log('Registro exitoso:', resp)),
      catchError(error => {
        console.error('Error al registrar el paciente:', error);
        return of(error);
      })
    ).subscribe();

  }

}
