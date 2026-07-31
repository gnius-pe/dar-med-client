import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/shared/auth/auth.service';
import {routes} from 'src/app/shared/routes/routes';
import {SideBarService} from 'src/app/shared/side-bar/side-bar.service';
import {SelectedMissionService} from "../../medical/missions/services/selected-mission.service";
import {Subscription} from "rxjs";
import {Mission} from "../../medical/missions/models/mission.model";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public routes = routes;
  public openBox = false;
  public miniSidebar = false;
  public user: any;
  isLoading = false;
  selectedMission: Mission | null = null;
  private selectedMissionSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private sideBar: SideBarService,
    private selectedMissionService: SelectedMissionService,
    private auth: AuthService,) {
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      this.miniSidebar = res == 'true';
    });
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
  }

  ngOnInit(): void {
    this.selectedMissionSubscription = this.selectedMissionService.getSelectedMission$().subscribe(
      (mission) => {
        this.selectedMission = mission;
      }
    );
  }

  ngOnDestroy(): void {
    this.selectedMissionSubscription.unsubscribe();
  }

  clearSelectedMission() {
    this.selectedMissionService.clearSelectedMission();
  }

  getRole() {
    let RoleName = "";
    this.user.roles.forEach((rol: any) => {
      RoleName = rol;
    });
    return RoleName;
  }

  openBoxFunc() {
    this.openBox = !this.openBox;
    const mainWrapper = document.getElementsByClassName('main-wrapper')[0];
    if (this.openBox) {
      mainWrapper.classList.add('open-msg-box');
    } else {
      mainWrapper.classList.remove('open-msg-box');
    }
  }

  logout() {
    this.showLoading();
    this.auth.logout();
    this.hideLoading();
  }

  public toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }

  public toggleMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
  }

  private showLoading() {
    this.isLoading = true;
  }

  private hideLoading() {
    this.isLoading = false;
  }
}
