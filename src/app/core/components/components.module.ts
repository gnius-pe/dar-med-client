import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsRoutingModule } from './components-routing.module';
import { ComponentsComponent } from './components.component';
import { CarouselComponent } from './carousel/carousel.component';


@NgModule({
  declarations: [
    ComponentsComponent,
    CarouselComponent
  ],
  exports: [
    CarouselComponent
  ],
  imports: [
    CommonModule,
    ComponentsRoutingModule
  ]
})
export class ComponentsModule { }
