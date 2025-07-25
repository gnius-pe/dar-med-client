import {Component, EventEmitter, Output} from '@angular/core';
import {Mission} from "../models/mission.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-mission-form',
  templateUrl: './mission-form.component.html',
  styleUrls: ['./mission-form.component.scss']
})
export class MissionFormComponent {

  @Output() missionSubmit = new EventEmitter<Mission>();

  missionForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.missionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      description: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]]
    }, {validators: this.dateValidator});
  }

  dateValidator(form: FormGroup) {
    const startDate = form.get('start_date')?.value;
    const endDate = form.get('end_date')?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return {dateInvalid: true};
    }
    return null;
  }

  onSubmit() {
    if (this.missionForm.invalid) {
      this.markFormGroupTouched();
      return
    }

    this.missionSubmit.emit(this.missionForm.getRawValue());
    this.missionForm.reset();
  }

  private markFormGroupTouched() {
    Object.keys(this.missionForm.controls).forEach(key => {
      const control = this.missionForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.missionForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        switch(fieldName) {
          case 'name': return 'El nombre es obligatorio';
          case 'description': return 'La descripción es obligatoria';
          case 'start_date': return 'La fecha de inicio es obligatoria';
          case 'end_date': return 'La fecha de fin es obligatoria';
          default: return `${fieldName} es obligatorio`;
        }
      }
      if (field.errors['maxlength']) {
        switch(fieldName) {
          case 'name': return `El nombre no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
          default: return `${fieldName} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
        }
      }
    }
    return '';
  }
}
