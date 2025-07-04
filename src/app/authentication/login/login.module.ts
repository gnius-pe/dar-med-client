import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { SharedModule } from 'src/app/shared/shared.module';
import {ComponentsModule} from "../../core/components/components.module";
import {LoadingOverlayComponent} from "../../shared/components/loading-overlay/loading-overlay.component";


@NgModule({
  declarations: [
    LoginComponent
  ],
    imports: [
        CommonModule,
        LoginRoutingModule,
        SharedModule,
        NgOptimizedImage,
        ComponentsModule,
        LoadingOverlayComponent
    ]
})
export class LoginModule { }
