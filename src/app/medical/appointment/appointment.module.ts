import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentRoutingModule } from './appointment-routing.module';
import { AppointmentComponent } from './appointment.component';
import { AddAppointmentsComponent } from './add-appointments/add-appointments.component';
import { EditAppointmentsComponent } from './edit-appointments/edit-appointments.component';
import { ListAppointmentsComponent } from './list-appointments/list-appointments.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AtencionMedicalComponent } from './atencion-medical/atencion-medical.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import {LoadingOverlayComponent} from "../../shared/components/loading-overlay/loading-overlay.component";
import {NotificationComponent} from "../../shared/components/notification/notification.component";
import {ConfirmationModalComponent} from "../../shared/components/confirmation-modal/confirmation-modal.component";
import {QRCodeModule} from "angularx-qrcode";


@NgModule({
  declarations: [
    AppointmentComponent,
    AddAppointmentsComponent,
    EditAppointmentsComponent,
    ListAppointmentsComponent,
    AtencionMedicalComponent,
    AppointmentFormComponent
  ],
  imports: [
    CommonModule,
    AppointmentRoutingModule,
    SharedModule,
    //
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    LoadingOverlayComponent,
    NotificationComponent,
    ConfirmationModalComponent,
    QRCodeModule
  ]
})
export class AppointmentModule { }
