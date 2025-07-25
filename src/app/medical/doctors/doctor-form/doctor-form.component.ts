import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DoctorService} from '../service/doctor.service';
import {DoctorConfigResponse, DoctorCreateData, DoctorUpdateData, Doctor, Role, Speciality} from "../models/doctor.model";

@Component({
  selector: 'app-doctor-form',
  templateUrl: './doctor-form.component.html',
  styleUrls: ['./doctor-form.component.scss']
})
export class DoctorFormComponent implements OnInit, OnChanges {

  doctorForm: FormGroup;

  @Input() doctorToEdit: Doctor | null = null;
  @Input() isEditMode = false;

  @Output() createDoctor = new EventEmitter<DoctorCreateData>()
  @Output() updateDoctor = new EventEmitter<DoctorUpdateData>()
  @Output() showError = new EventEmitter<string>();

  public roles: Role[] = [];
  public specialities: Speciality[] = [];
  public fileAvatar: File | null = null;
  public imagenPrev: string | ArrayBuffer | null = 'assets/img/user-06.jpg';

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService
  ) {
    this.doctorForm = this.setForm()
  }

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('doctorToEdit') && this.doctorToEdit) {
      this.patchForm();
    }
  }

  private setForm() {
    return this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: [''],
      password_confirmation: [''],
      birth_date: [''],
      gender: [''],
      education: [''],
      designation: [''],
      address: [''],
      role_id: ['', Validators.required],
      specialitie_id: ['', Validators.required],
      imagen: [null]
    });
  }

  private loadConfig(): void {
    this.doctorService.listConfig().subscribe((resp: DoctorConfigResponse) => {
      this.roles = resp.roles;
      this.specialities = resp.specialities;
    });
  }

  private patchForm(): void {
    if (!this.doctorToEdit) return;

    let formattedDate = '';
    if (this.doctorToEdit.birth_date) {
      formattedDate = new Date(this.doctorToEdit.birth_date).toISOString().split('T')[0];
    }

    if (this.doctorToEdit.avatar) {
      this.imagenPrev = this.doctorToEdit.avatar;
    }

    this.doctorForm.patchValue({
      name: this.doctorToEdit.name || '',
      surname: this.doctorToEdit.surname || '',
      email: this.doctorToEdit.email || '',
      phone: this.doctorToEdit.phone || '',
      birth_date: formattedDate,
      gender: this.doctorToEdit.gender || '',
      education: this.doctorToEdit.education || '',
      designation: this.doctorToEdit.designation || '',
      address: this.doctorToEdit.address || '',
      role_id: '',
      specialitie_id: this.doctorToEdit.specialitie_id || ''
    });

    if (this.isEditMode) {
      this.doctorForm.get('password')?.clearValidators();
      this.doctorForm.get('password')?.updateValueAndValidity();
    }
  }

  save(): void {
    if (this.doctorForm.invalid) {
      this.showError.emit("COMPLETE LOS CAMPOS OBLIGATORIOS");
      return;
    }

    const formValues = this.doctorForm.value;

    if (formValues.password && formValues.password !== formValues.password_confirmation) {
      this.showError.emit("LAS CONTRASEÑAS DEBEN SER IGUALES");
      return;
    }

    if (this.isEditMode) {
      const updateData: DoctorUpdateData = this.buildUpdateData(formValues);
      this.updateDoctor.emit(updateData);
    } else {
      if (!formValues.password) {
        this.showError.emit("LA CONTRASEÑA ES REQUERIDA");
        return;
      }

      const createData: DoctorCreateData = this.buildCreateData(formValues);
      this.createDoctor.emit(createData);
      this.resetForm();
    }
  }

  private buildCreateData(formValues: any): DoctorCreateData {
    return {
      name: formValues.name,
      surname: formValues.surname,
      email: formValues.email,
      phone: formValues.phone,
      password: formValues.password,
      birth_date: formValues.birth_date,
      gender: formValues.gender,
      education: formValues.education,
      designation: formValues.designation,
      address: formValues.address,
      role_id: formValues.role_id,
      specialitie_id: formValues.specialitie_id,
      imagen: this.fileAvatar || undefined
    };
  }

  private buildUpdateData(formValues: any): DoctorUpdateData {
    const updateData: DoctorUpdateData = {
      name: formValues.name,
      surname: formValues.surname,
      email: formValues.email,
      phone: formValues.phone,
      birth_date: formValues.birth_date,
      gender: formValues.gender,
      education: formValues.education,
      designation: formValues.designation,
      address: formValues.address,
      role_id: formValues.role_id,
      specialitie_id: formValues.specialitie_id
    };

    if (formValues.password) {
      updateData.password = formValues.password;
    }

    if (this.fileAvatar) {
      updateData.imagen = this.fileAvatar;
    }

    return updateData;
  }

  loadFile($event: any): void {
    if ($event.target.files[0].type.indexOf("image") < 0) {
      this.showError.emit("SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN");
      return;
    }

    this.fileAvatar = $event.target.files[0];
    this.doctorForm.patchValue({imagen: this.fileAvatar});

    const reader = new FileReader();
    if (this.fileAvatar == null) return;

    reader.readAsDataURL(this.fileAvatar);
    reader.onloadend = () => this.imagenPrev = reader.result;
  }

  resetForm(): void {
    this.doctorForm.reset();
    this.fileAvatar = null;
    this.imagenPrev = 'assets/img/user-06.jpg';
  }
}
