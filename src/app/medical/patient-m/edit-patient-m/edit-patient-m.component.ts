import {Component, OnInit} from '@angular/core';
import {PatientMService} from '../service/patient-m.service';
import {ActivatedRoute} from '@angular/router';
import {Patient} from "../models/patient.model";

@Component({
  selector: 'app-edit-patient-m',
  templateUrl: './edit-patient-m.component.html',
  styleUrls: ['./edit-patient-m.component.scss']
})
export class EditPatientMComponent implements OnInit {

  public patient_id = '';
  public patient: Patient | undefined

  constructor(
    public patientService: PatientMService,
    public activedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {

    this.activedRoute.params.subscribe((resp: any) => {
      this.patient_id = resp.id;
    })


    this.patientService.showPatient(this.patient_id).subscribe((resp: any) => {
      this.patient = resp.patient;
    })

  }

  public updatePatient(formData: Patient) {

    this.patientService.updatePatient(this.patient_id,formData).subscribe((resp:any) => {
       console.log(resp);
     })
  }
}
