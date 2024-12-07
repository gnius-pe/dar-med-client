import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientMRoutingModule } from './patient-m-routing.module';
import { PatientMComponent } from './patient-m.component';
import { AddPatientMComponent } from './add-patient-m/add-patient-m.component';
import { EditPatientMComponent } from './edit-patient-m/edit-patient-m.component';
import { ListPatientMComponent } from './list-patient-m/list-patient-m.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientMProfileComponent } from './patient-m-profile/patient-m-profile.component';
import { PatientFormComponent } from './patient-form/patient-form.component';
import {QRCodeModule} from "angularx-qrcode";
import { GeographicLocationFormComponent } from './geographic-location-form/geographic-location-form.component';


@NgModule({
  declarations: [
    PatientMComponent,
    AddPatientMComponent,
    EditPatientMComponent,
    ListPatientMComponent,
    PatientMProfileComponent,
    PatientFormComponent,
    GeographicLocationFormComponent
  ],
    imports: [
        CommonModule,
        PatientMRoutingModule,
        SharedModule,
        //
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        QRCodeModule
    ]
})
export class PatientMModule { }
