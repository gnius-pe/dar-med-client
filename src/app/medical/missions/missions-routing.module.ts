import {RouterModule, Routes} from "@angular/router";
import {MissionsComponent} from "./missions.component";
import {NgModule} from "@angular/core";
import {ListMissionsComponent} from "./list-missions/list-missions.component";
import {CreateMissionComponent} from "./create-mission/create-mission.component";

const routes: Routes = [{
  path: '',
  component: MissionsComponent,
  children: [
    {
      path: 'list-missions',
      component: ListMissionsComponent
    },
    {
      path: 'add-mission',
      component: CreateMissionComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MissionsRoutingModule {
}
