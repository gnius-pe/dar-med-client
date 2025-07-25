import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalRoutingModule } from './medical-routing.module';
import { MedicalComponent } from './medical.component';
import { SharedModule } from '../shared/shared.module';
import { CreateDoctorTicketsModalComponent } from './tickets/create-doctor-tickets-modal/create-doctor-tickets-modal.component';

@NgModule({
    declarations: [
        MedicalComponent,
        CreateDoctorTicketsModalComponent,
    ],
    exports: [
        CreateDoctorTicketsModalComponent
    ],
    imports: [
        CommonModule,
        MedicalRoutingModule,
        SharedModule,
    ]
})
export class MedicalModule { }
