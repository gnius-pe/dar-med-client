import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
  public showMessage = false;

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
      this.patientForm.markAllAsTouched();
      return
    }

    const formData = this.patientForm.value;
    formData.birth_date = new Date(formData.birth_date).toISOString().split('T')[0]; // Format date for bd

    this.sendPatientData.emit(formData);
    this.resetForm();
    this.triggerMessage();
  }

  private resetForm(): void {
    this.patientForm.reset();
  }

  private triggerMessage(): void {
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }

  private createPersonalForm(): FormGroup {
    return this.fb.group({
      identification_type: ['', [Validators.required]],
      identification_number: ['', [Validators.required, Validators.pattern(/^\d{1,8}$/)]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: [''],
      birth_date: ['', [Validators.required]],
      first_phone: ['', [Validators.required]],
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

  public allowOnlyNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    const regex = /^[0-9]*$/;

    if (!regex.test(input.value)) {
      input.value = input.value.replace(/[^0-9]/g, '');
    }
  }

  public toUpperCase(field: string): void {
    const value = this.patientForm.get(field)?.value;
    if (value) {
      this.patientForm.get(field)?.setValue(value.toUpperCase(), {emitEvent: false});
    }
  }

}
