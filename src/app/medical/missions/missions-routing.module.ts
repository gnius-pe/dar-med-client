import {RouterModule, Routes} from "@angular/router";
import {MissionsComponent} from "./missions.component";
import {NgModule} from "@angular/core";
import {ListMissionsComponent} from "./list-missions/list-missions.component";

const routes: Routes = [{
  path: '',
  component: MissionsComponent,
  children: [
    {
      path: 'list-missions',
      component: ListMissionsComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MissionsRoutingModule {}
