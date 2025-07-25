import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorsRoutingModule } from './doctors-routing.module';
import { DoctorsComponent } from './doctors.component';
import { AddDoctorComponent } from './add-doctor/add-doctor.component';
import { EditDoctorComponent } from './edit-doctor/edit-doctor.component';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { DoctorMProfileComponent } from './doctor-m-profile/doctor-m-profile.component';
import {LoadingOverlayComponent} from "../../shared/components/loading-overlay/loading-overlay.component";
import {NotificationComponent} from "../../shared/components/notification/notification.component";
import { DoctorFormComponent } from './doctor-form/doctor-form.component';
import {MedicalModule} from "../medical.module";


@NgModule({
  declarations: [
    DoctorsComponent,
    AddDoctorComponent,
    EditDoctorComponent,
    ListDoctorComponent,
    DoctorMProfileComponent,
    DoctorFormComponent
  ],
    imports: [
        CommonModule,
        DoctorsRoutingModule,
        SharedModule,
        //
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        LoadingOverlayComponent,
        NotificationComponent,
        MedicalModule
    ]
})
export class DoctorsModule { }
