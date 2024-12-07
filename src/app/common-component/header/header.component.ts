import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { routes } from 'src/app/shared/routes/routes';
import { SideBarService } from 'src/app/shared/side-bar/side-bar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public routes = routes;
  public openBox = false;
  public miniSidebar  = false;
  public addClass = false;
  public user:any;

  constructor(public router: Router,private sideBar: SideBarService,public auth: AuthService) {
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    console.log(this.user);
  }
  getRole(){
    let RoleName = "";
    this.user.roles.forEach((rol:any) => {
      RoleName = rol;
    });
    return RoleName;
  }
  openBoxFunc() {
    this.openBox = !this.openBox;
    /* eslint no-var: off */
    var mainWrapper = document.getElementsByClassName('main-wrapper')[0];
    if (this.openBox) {
      mainWrapper.classList.add('open-msg-box');
    } else {
      mainWrapper.classList.remove('open-msg-box');
    }
  }
  logout(){
    this.auth.logout();
  }
  public toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }
  public toggleMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();

    const overlay = document.querySelector('.sidebar-overlay') as HTMLElement;
    const root = document.querySelector('html') as HTMLElement;
    const sidebar = document.getElementById('sidebar');

    if (this.sideBar.toggleMobileSideBar.value === 'true') {
      root?.classList.add('menu-opened');
      sidebar?.classList.add('opened');
      overlay?.classList.add('opened');
    } else {
      root?.classList.remove('menu-opened');
      sidebar?.classList.remove('opened');
      overlay?.classList.remove('opened');
    }
  }
  }
