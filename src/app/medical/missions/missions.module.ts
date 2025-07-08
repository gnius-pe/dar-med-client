import {NgModule} from "@angular/core";
import {MissionsComponent} from "./missions.component";
import {ListMissionsComponent} from "./list-missions/list-missions.component";
import {MissionsRoutingModule} from "./missions-routing.module";

@NgModule({
  declarations:[
    MissionsComponent,
    ListMissionsComponent
  ],
  imports: [
    MissionsRoutingModule
  ]
})

export class MissionsModule {}
