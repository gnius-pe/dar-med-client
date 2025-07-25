import {NgModule} from "@angular/core";
import {MissionsComponent} from "./missions.component";
import {ListMissionsComponent} from "./list-missions/list-missions.component";
import {MissionsRoutingModule} from "./missions-routing.module";
import { CreateMissionComponent } from './create-mission/create-mission.component';
import { MissionFormComponent } from './mission-form/mission-form.component';
import {ReactiveFormsModule} from "@angular/forms";
import {DatePipe, NgForOf, NgIf, SlicePipe} from "@angular/common";
import {LoadingOverlayComponent} from "../../shared/components/loading-overlay/loading-overlay.component";
import {NotificationComponent} from "../../shared/components/notification/notification.component";

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
    NgIf,
    LoadingOverlayComponent,
    NotificationComponent,
    SlicePipe,
    DatePipe,
    NgForOf
  ]
})

export class MissionsModule {}
