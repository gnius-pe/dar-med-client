import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-list-missions',
  templateUrl: './list-missions.component.html',
  styleUrls: ['./list-missions.component.scss']
})
export class ListMissionsComponent implements OnInit {

  ngOnInit(): void {
    window.alert("Missions");
    console.log("misiones");
  }
}
