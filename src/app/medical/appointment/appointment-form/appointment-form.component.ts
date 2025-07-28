import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Appointment,
  AppointmentConfigResponse,
  AppointmentCreateData,
  AppointmentUpdateData,
  AvailableDoctor, FilterDoctorsResponse, PatientSearchResponse
} from "../models/appointment.model";
import {Speciality} from "../../doctors/models/doctor.model";
import {AppointmentService} from "../service/appointment.service";

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent implements OnInit, OnChanges{
  appointmentForm: FormGroup;

  @Input() appointmentToEdit: Appointment | null = null;
  @Input() isEditMode = false;

  @Output() createAppointment = new EventEmitter<AppointmentCreateData>();
  @Output() updateAppointment = new EventEmitter<AppointmentUpdateData>();
  @Output() showError = new EventEmitter<string>();

  // Configuration data
  public specialities: Speciality[] = [];

  // Doctors and selection
  public availableDoctors: AvailableDoctor[] = [];
  public selectedDoctor: AvailableDoctor | null = null;

  // UI state
  public isLoadingDoctors = false;
  public showDoctorsList = false;
  public minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService
  ) {
    this.appointmentForm = this.setForm();
  }

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('appointmentToEdit') && this.appointmentToEdit) {
      this.patchForm();
    }
  }

  private setForm(): FormGroup {
    return this.fb.group({
      date_appointment: ['', Validators.required],
      specialitie_id: ['', Validators.required],
      identification_number: ['', Validators.required],
      first_name: [{value: '', disabled: true}, Validators.required],
      last_name: [{value: '', disabled: true}, Validators.required],
      first_phone: [{value: '', disabled: true}],
      name_companion: [{value: '', disabled: true}],
      surname_companion: [{value: '', disabled: true}],
      patient_id: [''],
      amount: [0],
      amount_add: [0],
      method_payment: ['EFECTIVO'],
      doctor_id: ['', Validators.required]
    });
  }

  private loadConfig(): void {
    this.appointmentService.listConfig().subscribe({
      next: (resp: AppointmentConfigResponse) => {
        this.specialities = resp.specialities;
      },
      error: () => {
        this.showError.emit('Error al cargar la configuración');
      }
    });
  }

  private patchForm(): void {
    if (!this.appointmentToEdit) return;

    let formattedDate = '';
    if (this.appointmentToEdit.date_appointment) {
      formattedDate = new Date(this.appointmentToEdit.date_appointment).toISOString().split('T')[0];
    }

    this.appointmentForm.patchValue({
      date_appointment: formattedDate,
      specialitie_id: this.appointmentToEdit.specialitie_id,
      doctor_id: this.appointmentToEdit.doctor_id,
      amount: this.appointmentToEdit.amount || 0
    });

    if (this.isEditMode) {
      this.appointmentForm.get('identification_number')?.clearValidators();
      this.appointmentForm.get('first_name')?.clearValidators();
      this.appointmentForm.get('last_name')?.clearValidators();
      this.appointmentForm.updateValueAndValidity();
    }
  }

  filterDoctors(): void {
    const dateAppointment = this.appointmentForm.get('date_appointment')?.value;
    const specialitieId = this.appointmentForm.get('specialitie_id')?.value;

    if (!dateAppointment) {
      this.showError.emit('Seleccione una fecha para la cita');
      return;
    }

    this.isLoadingDoctors = true;
    this.availableDoctors = [];
    this.selectedDoctor = null;
    this.showDoctorsList = false;

    const filterData = {
      date_appointment: dateAppointment,
      specialitie_id: specialitieId || undefined
    };

    this.appointmentService.filterDoctors(filterData).subscribe({
      next: (resp: FilterDoctorsResponse) => {
        this.availableDoctors = resp.doctors;
        this.showDoctorsList = true;
        this.isLoadingDoctors = false;

        if (this.availableDoctors.length === 0) {
          this.showError.emit('No hay doctores disponibles para la fecha y especialidad seleccionada');
        }
      },
      error: () => {
        this.isLoadingDoctors = false;
        this.showError.emit('Error al buscar doctores disponibles');
      }
    });
  }

  selectDoctor(doctor: AvailableDoctor): void {
    this.selectedDoctor = doctor;
    this.appointmentForm.patchValue({
      doctor_id: doctor.doctor.id
    });
  }

  searchPatient(): void {

    const identificationNumber = String(this.appointmentForm.get('identification_number')?.value)

    if (!identificationNumber || identificationNumber.length !== 8) {
      this.showError.emit('Ingrese un número de documento válido (8 dígitos)');
      return;
    }

    this.appointmentService.searchPatient(identificationNumber).subscribe({
      next: (resp: PatientSearchResponse) => {
        if (resp.message === 403) {
          this.appointmentForm.patchValue({
            first_name: '',
            last_name: '',
            first_phone: '',
            patient_id: '',
          });
        } else {
          this.appointmentForm.patchValue({
            first_name: resp.first_name || '',
            last_name: resp.last_name || '',
            first_phone: resp.first_phone || '',
            patient_id: resp.patient_id || '',
          });
        }
      },
      error: () => {
        this.showError.emit('Error al buscar el paciente');
      }
    });
  }

  resetPatient(): void {
    this.appointmentForm.patchValue({
      identification_number: '',
      first_name: '',
      last_name: '',
      first_phone: '',
      name_companion: '',
      surname_companion: ''
    });
  }

  private validateAppointmentDate(): boolean {
    const appointmentDate = new Date(this.appointmentForm.get('date_appointment')?.value);
    const today = new Date();

    if (appointmentDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
      this.showError.emit('La fecha de la cita no puede ser anterior a la fecha actual');
      return false;
    }
    return true;
  }

  save(): void {
    if (this.appointmentForm.invalid) {
      this.showError.emit('Complete todos los campos obligatorios');
      return;
    }

    if (!this.validateAppointmentDate()) {
      return;
    }

    if (!this.selectedDoctor) {
      this.showError.emit('Seleccione un doctor para la cita');
      return;
    }

    const formValues = this.appointmentForm.value;

    if (this.isEditMode) {
      const updateData: AppointmentUpdateData = this.buildUpdateData(formValues);
      this.updateAppointment.emit(updateData);
    } else {
      const createData: AppointmentCreateData = this.buildCreateData(formValues);
      this.createAppointment.emit(createData);
      this.resetForm();
    }
  }

  private buildCreateData(formValues: any): AppointmentCreateData {
    return {
      doctor_id: formValues.doctor_id,
      patient_id: formValues.patient_id || '',
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      identification_number: formValues.identification_number,
      first_phone: formValues.first_phone || undefined,
      name_companion: formValues.name_companion || undefined,
      surname_companion: formValues.surname_companion || undefined,
      date_appointment: formValues.date_appointment,
      specialitie_id: formValues.specialitie_id,
      amount: formValues.amount || undefined,
      amount_add: formValues.amount_add || undefined,
      method_payment: formValues.method_payment || undefined
    };
  }

  private buildUpdateData(formValues: any): AppointmentUpdateData {
    return {
      doctor_id: formValues.doctor_id,
      date_appointment: formValues.date_appointment,
      specialitie_id: formValues.specialitie_id,
      amount: formValues.amount || undefined
    };
  }

  resetForm(): void {
    this.appointmentForm.reset({
      amount: 0,
      amount_add: 0,
      method_payment: 'EFECTIVO'
    });
    this.availableDoctors = [];
    this.selectedDoctor = null;
    this.showDoctorsList = false;
  }
}
