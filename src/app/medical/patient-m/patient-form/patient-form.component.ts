import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Patient} from "../models/patient.model";
import {PatientLookupService} from "../service/patient-lookup.service";
import {tap, catchError, of} from 'rxjs';
import {GeographicLocationService} from "../service/geographic_location.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnChanges {

  @Input() patientData: Patient | undefined;

  @Output() sendPatientData: EventEmitter<Patient> = new EventEmitter<Patient>();

  public patientForm: FormGroup;

  public isLookingUpDocument = false;
  public lookupError = '';
  public user: any;

  constructor(
    private fb: FormBuilder,
    private patientLookupService: PatientLookupService,
    private locationService: GeographicLocationService,
    private router: Router,
  ) {
    const USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;
    this.patientForm = this.createPersonalForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('patientData') && this.patientData != undefined) {
      this.patientForm.patchValue(this.patientData);
    }
  }

  public isRecepcionista(): boolean {
    return this.user && this.user.roles && this.user.roles.includes('RECEPCIONISTA');
  }

  onDocumentNumberBlur(): void {
    const identificationNumber = this.patientForm.get('identification_number')?.value;

    if (!identificationNumber || identificationNumber.length !== 8) {
      return;
    }

    this.isLookingUpDocument = true;
    this.lookupError = '';

    this.patientLookupService.lookupDni(identificationNumber).pipe(
      tap((response: any) => {
        if (response && response.first_name && response.last_name) {
          this.patientForm.patchValue({
            first_name: response.first_name,
            last_name: response.last_name,
          });
        } else {
          this.lookupError = 'No hay datos registrados. Completa la información del paciente manualmente.';
        }
      }),
      catchError(() => {
        this.lookupError = 'Error al consultar el DNI.';
        return of(null);
      })
    ).subscribe({
      complete: () => {
        this.isLookingUpDocument = false;
      }
    });
  }

  public preparePatientData(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return
    }

    const formData = this.patientForm.value;
    formData.birth_date = new Date(formData.birth_date).toISOString().split('T')[0];

    this.sendPatientData.emit(formData);
  }

  private createPersonalForm(): FormGroup {
    return this.fb.group({
      identification_type: ['DNI', [Validators.required]],
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
