import { Component } from '@angular/core';
import { AppointmentService } from '../service/appointment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-atencion-medical',
  templateUrl: './atencion-medical.component.html',
  styleUrls: ['./atencion-medical.component.scss']
})
export class AtencionMedicalComponent {

  first_name:string = '';
  last_name:string = '';
  //mobile:string = '';
  
  identification_number:number = 0;
  first_phone:string = ' ';
  //name_companion:string = '';
  //surname_companion:string = '';

  public text_success:string = '';
  public text_validation:string = '';

  public appointment_id:any;
  public appointment_selected:any;

  description:any;
  name_medical:any;
  uso:any;

  public medical:any = [];
  public appointment_attention_selected:any;
  constructor(
    public appointmentService: AppointmentService,
    public activedRoute: ActivatedRoute,
  ) {
    
  }
  
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.activedRoute.params.subscribe((resp:any) => {
      console.log(resp);
      this.appointment_id = resp.id;
    })

    this.appointmentService.showAppointment(this.appointment_id).subscribe((resp:any) => {
      console.log(resp);
      this.appointment_selected = resp.appointment;
      // Datos del paciente
      this.first_name = this.appointment_selected.patient.first_name;
      this.last_name = this.appointment_selected.patient.last_name;
      
      this.first_phone = this.appointment_selected.patient.first_phone;
      
      this.identification_number = this.appointment_selected.patient.identification_number;
     // this.name_companion = this.appointment_selected.patient.name_companion;
     // this.surname_companion = this.appointment_selected.patient.surname_companion;
    })

    this.appointmentService.showAppointmentAttention(this.appointment_id).subscribe((resp:any) => {
      console.log(resp);
      this.appointment_attention_selected = resp.appointment_attention;
      this.medical = this.appointment_attention_selected.receta_medica;
      this.description = this.appointment_attention_selected.description;
    })
  }

  addMedicamento(){
    this.medical.push({
      name_medical: this.name_medical,
      uso: this.uso,
    })
    this.uso = '';
    this.name_medical = '';
  }

  deleteMedical(i:any) {
    this.medical.splice(i,1);
  }

  save(){

    if(!this.description || this.medical.lenght == 0){
      this.text_validation = "ES NECESARIO INGRESAR EL DIAGNOSTICO Y UNA RECETA MEDICA";
      return;
    }

    let data = {
      appointment_id: this.appointment_id,
      patient_id: this.appointment_selected.patient_id,
      description: this.description,
      medical: this.medical,
    }

    this.appointmentService.registerAttention(data).subscribe((resp:any) => {
      console.log(resp);
      this.text_success = "SE GUARDO LA INFORMACIÓN DE LA ATENCIÓN MEDICA";
    })

  }
}
