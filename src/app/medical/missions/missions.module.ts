import {NgModule} from "@angular/core";
import {MissionsComponent} from "./missions.component";
import {ListMissionsComponent} from "./list-missions/list-missions.component";
import {MissionsRoutingModule} from "./missions-routing.module";
import { CreateMissionComponent } from './create-mission/create-mission.component';
import { MissionFormComponent } from './mission-form/mission-form.component';
import {ReactiveFormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@NgModule({
  declarations:[
    MissionsComponent,
    ListMissionsComponent,
    CreateMissionComponent,
    MissionFormComponent
  ],
  imports: [
    MissionsRoutingModule,
    ReactiveFormsModule,
    NgIf
  ]
})

export class MissionsModule {}
