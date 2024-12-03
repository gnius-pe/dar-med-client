import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../service/appointment.service';

@Component({
  selector: 'app-add-appointments',
  templateUrl: './add-appointments.component.html',
  styleUrls: ['./add-appointments.component.scss']
})
export class AddAppointmentsComponent implements OnInit {

  hours: any = [];
  specialities: any = [];
  date_appointment: any = new Date();  // Fecha de la cita
  minDate: Date = new Date();  // Fecha mínima, que será la fecha actual
  hour: any;
  specialitie_id: any;

  first_name: string = '';
  last_name: string = '';
  identification_number: number = 0;
  first_phone:string='';

 
  
  //name_companion: string = '';
  //surname_companion: string = '';

  //amount: number = 0;
  //amount_add: number = 0;
 // method_payment: string = '';

  DOCTORS: any = [];
  DOCTOR_SELECTED: any;
  selected_segment_hour:any;

  public text_success: string = '';
  public text_validation: string = '';

  constructor(public appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.appointmentService.listConfig().subscribe((resp: any) => {
      this.hours = resp.hours;
      this.specialities = resp.specialities;
    });
  }

  // Validar si la fecha seleccionada es anterior a la fecha actual
  validateAppointmentDate(): boolean {
    const today = new Date();
    const appointmentDate = new Date(this.date_appointment);

    // Comparar las fechas sin las horas
    if (appointmentDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
      this.text_validation = "La fecha de la cita no puede ser anterior a la fecha actual.";
      return false;
    }
    return true;
  }

  save() {
    this.text_validation = "";

    // Validación de la fecha de la cita
    if (!this.validateAppointmentDate()) {
      return;  // Si la validación falla, no continuar con el registro
    }

    /*if (this.amount < this.amount_add) {
      this.text_validation = "EL MONTO INGRESADO COMO ADELANTO NO PUEDE SER MAYOR AL COSTO DE LA CITA MEDICA";
      return;
    }
  */
    if (!this.first_name || !this.last_name || !this.identification_number || !this.date_appointment
      || !this.specialitie_id || !this.selected_segment_hour ) {
      this.text_validation = "LOS CAMPOS SON NECESARIOS (SEGMENTO DE HORA, LA FECHA, LA ESPECIALIDAD, PACIENTE )";
      return;
    }

    let data = {
      "doctor_id": this.DOCTOR_SELECTED.doctor.id,
      first_name: this.first_name,
      last_name: this.last_name,
    
      identification_number: this.identification_number,
   
      "date_appointment": this.date_appointment,
      "specialitie_id": this.specialitie_id,
      "doctor_schedule_join_hour_id": this.selected_segment_hour.id,
        
    };

    this.appointmentService.registerAppointment(data).subscribe((resp: any) => {
      console.log(resp);
      this.resetForm();
      this.text_success = "LA CITA MEDICA SE REGISTRO CON EXITO";
      setTimeout(() => {
        this.text_success = '';  // Limpiar el mensaje
      }, 500);  
    });

    
  }

  resetForm() {
    this.first_name = '';
  this.last_name = '';
  this.identification_number = 0;
  this.date_appointment = new Date();  // Resetea la fecha a la actual
  this.hour= " ";
  
  this.specialitie_id = null;
  
  this.DOCTOR_SELECTED = null;
  this.text_success = '';  // Limpiar mensaje de éxito
  this.text_validation = '';  // Limpiar mensaje de validación

  // Limpiar los campos relacionados con la especialidad y el doctor seleccionado
  this.specialitie_id = null;
  this.selected_segment_hour = null;
  this.DOCTOR_SELECTED = null;

  // Opcional: Resetear la lista de doctores para que no se queden opciones previas
  this.DOCTORS = [];
  }

  filtro() {
    let data = {
      date_appointment: this.date_appointment,
      hour: this.hour,
      specialitie_id: this.specialitie_id,
    };
    this.appointmentService.listFilter(data).subscribe((resp: any) => {
      console.log(resp);
      this.DOCTORS = resp.doctors;
    });
  }

  countDisponibilidad(DOCTOR: any) {
    let SEGMENTS = [];
    SEGMENTS = DOCTOR.segments.filter((item: any) => !item.is_appointment);
    return SEGMENTS.length;
  }

  showSegment(DOCTOR: any) {
    this.DOCTOR_SELECTED = DOCTOR;
  }

  selectSegment(SEGMENT: any) {
    this.selected_segment_hour = SEGMENT;
  }

  validateNumbers() {
    // Asegurarse de que el valor sea un string y solo contenga números
     this.identification_number.toString().replace(/[^0-9]/g, '');
  }
  
  
  filterPatient() {
    this.appointmentService.listPatient(this.identification_number + "").subscribe((resp: any) => {
      console.log(resp);
      if (resp.message == 403) {
        this.resetPatient();
      } else {
        this.first_name = resp.first_name;
        this.last_name = resp.last_name;
        this.first_phone = resp.first_phone;
        this.identification_number = resp.identification_number;
      }
    });
  }

  resetPatient() {
    this.first_name = '';
    this.last_name = '';
    this.first_phone = '';
    this.identification_number= 0;

   
  }
} 