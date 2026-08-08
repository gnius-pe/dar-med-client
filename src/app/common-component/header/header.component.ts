import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { routes } from 'src/app/shared/routes/routes';
import { SideBarService } from 'src/app/shared/side-bar/side-bar.service';
import { SelectedMissionService } from '../../medical/missions/services/selected-mission.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Mission } from '../../medical/missions/models/mission.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public routes = routes;
  public openBox = false;
  public miniSidebar = false;
  public user: AuthUser | null = null;
  isLoading = false;
  selectedMission: Mission | null = null;

  private destroy$ = new Subject<void>();
  private selectedMissionSubscription!: Subscription;

  constructor(
    private router: Router,
    private sideBar: SideBarService,
    private selectedMissionService: SelectedMissionService,
    private auth: AuthService
  ) {
    this.loadUser();
    this.initSideBarListeners();
  }

  ngOnInit(): void {
    this.selectedMissionSubscription = this.selectedMissionService
      .getSelectedMission$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mission) => {
        this.selectedMission = mission;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.selectedMissionSubscription.unsubscribe();
  }

  clearSelectedMission(): void {
    this.selectedMissionService.clearSelectedMission();
  }

  getRole(): string {
    if (!this.user?.roles || this.user.roles.length === 0) {
      return '';
    }

    return this.user.roles[0];
  }

  openBoxFunc(): void {
    this.openBox = !this.openBox;
    const mainWrapper = document.querySelector('.main-wrapper');
    mainWrapper?.classList.toggle('open-msg-box', this.openBox);
  }

  logout(): void {
    this.showLoading();
    this.auth.logout();
    this.hideLoading();
  }

  toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }

  toggleMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
  }

  private loadUser(): void {
    const userStorage = localStorage.getItem('user');
    this.user = userStorage ? JSON.parse(userStorage) : null;
  }

  private initSideBarListeners(): void {
    this.sideBar.toggleSideBar.pipe(takeUntil(this.destroy$)).subscribe((res: string) => {
      this.miniSidebar = res === 'true';
    });
  }

  private showLoading(): void {
    this.isLoading = true;
  }

  private hideLoading(): void {
    this.isLoading = false;
  }
}

interface AuthUser {
  name: string;
  roles: string[];
  [key: string]: any;
}
