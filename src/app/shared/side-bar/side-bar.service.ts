import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data/data.service';
interface MainMenu {
  menu: MenuItem[];
}

interface MenuItem {
  menuValue: string;
  showSubRoute: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  public toggleSideBar: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('isMiniSidebar') || "false"
  );

  public toggleMobileSideBar: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('isMobileSidebar') || "false"
  );

  public expandSideBar: BehaviorSubject<string> = new BehaviorSubject<string>("false");

  constructor(private data: DataService) {
    this.toggleMobileSideBar.subscribe((state: string) => {
      this.applyMobileSideBarClasses(state);
    });
  }

  private applyMobileSideBarClasses(state: string): void {
    const root = document.querySelector('html') as HTMLElement;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay') as HTMLElement;

    if (state === 'true') {
      root?.classList.add('menu-opened');
      sidebar?.classList.add('opened');
      overlay?.classList.add('opened');
    } else {
      root?.classList.remove('menu-opened');
      sidebar?.classList.remove('opened');
      overlay?.classList.remove('opened');
    }
  }

  public switchSideMenuPosition(): void {
    const isMiniSidebar = localStorage.getItem('isMiniSidebar');
    const newState = !isMiniSidebar;

    if (newState) {
      localStorage.setItem('isMiniSidebar', 'true');
      this.toggleSideBar.next('true');
    } else {
      localStorage.removeItem('isMiniSidebar');
      this.toggleSideBar.next('false');
    }

    const menuValue = sessionStorage.getItem('menuValue');
    this.data.sideBar.forEach((mainMenus: MainMenu) => {
      mainMenus.menu.forEach((resMenu: MenuItem) => {
        resMenu.showSubRoute = newState ? false : menuValue === resMenu.menuValue;
      });
    });
  }

  public switchMobileSideBarPosition(): void {
    if (localStorage.getItem('isMobileSidebar')) {
      this.toggleMobileSideBar.next("false");
      localStorage.removeItem('isMobileSidebar');
    } else {
      this.toggleMobileSideBar.next("true");
      localStorage.setItem('isMobileSidebar', 'true');
    }
  }

}
