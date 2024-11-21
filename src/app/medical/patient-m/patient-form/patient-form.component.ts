import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {Validators} from "ngx-editor";
import {Patient} from "../models/patient.model";

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnChanges {

  @Input() patientData: Patient | undefined;

  @Output() sendPatientData: EventEmitter<Patient> = new EventEmitter<Patient>();

  public patientForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) {
    this.patientForm = this.createPersonalForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('patientData') && this.patientData != undefined) {
      this.patientForm.patchValue(this.patientData);
    }
  }

  public preparePatientData(): void {
    this.patientForm.get('identification_type')?.setValue('DNI');


    if (this.patientForm.invalid) {
      console.log('error');
      return
    }

    const formData = this.patientForm.value;
    formData.birth_date = new Date(formData.birth_date).toISOString().split('T')[0]; // Format date for bd

    this.sendPatientData.emit(formData);
  }

  private createPersonalForm(): FormGroup {
    return this.fb.group({
      identification_type: ['', [Validators.required]],
      identification_number: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: [''],
      birth_date: [''],
      first_phone: [''],
      second_phone: [''],
      gender: ['', [Validators.required]],
      message: [''],
      visit_condition: [''],
      spiritual_diagnosis: [''],
      medical_examination: [false],
      spiritual_support: [false],
      permission_to_call: [false]
    });
  }

}
