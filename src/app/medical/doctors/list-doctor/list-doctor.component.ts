import {Component, OnInit} from '@angular/core';
import {DoctorService} from '../service/doctor.service';
import {MatTableDataSource} from '@angular/material/table';
import {Doctor, DoctorListResponse} from "../models/doctor.model";

@Component({
  selector: 'app-list-doctor',
  templateUrl: './list-doctor.component.html',
  styleUrls: ['./list-doctor.component.scss']
})
export class ListDoctorComponent implements OnInit {

  public usersList: any = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public lastIndex = 0;
  public pageSize = 10;
  public totalData = 0;
  public skip = 0;//MIN
  public limit: number = this.pageSize;//MAX
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  showCreateTicketsModal = false;
  selectedDoctorForTickets: number | null = null;

  public role_generals: any = [];
  public doctor_selected: any;
  public user: any;

  constructor(
    public doctorService: DoctorService,
  ) {

  }

  ngOnInit() {
    this.getTableData();
    this.user = this.doctorService.authService.user;
  }

  isPermission(permission: string) {
    if (this.user.roles.includes('Super-Admin')) {
      return true;
    }
    if (this.user.permissions.includes(permission)) {
      return true;
    }
    return false;
  }

  private getTableData(): void {

    this.showLoading();
    this.usersList = [];
    this.serialNumberArray = [];

    this.doctorService.listDoctors().subscribe((resp: DoctorListResponse) => {
      this.totalData = resp.users.length;
      this.role_generals = resp.users;
      this.getTableDataGeneral();
      this.hideLoading();
    })
  }

  getTableDataGeneral() {
    this.usersList = [];
    this.serialNumberArray = [];

    this.role_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {

        this.usersList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.usersList);
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  selectUser(rol: any) {
    this.doctor_selected = rol;
  }

  deleteUser(): void {
    this.doctorService.deleteDoctor(this.doctor_selected.id).subscribe({
      next: () => {

        const INDEX = this.usersList.findIndex((item: any) => item.id == this.doctor_selected.id);
        if (INDEX !== -1) {
          this.usersList.splice(INDEX, 1);

          $('#delete_patient').hide();
          $("#delete_patient").removeClass("show");
          $(".modal-backdrop").remove();
          $("body").removeClass();
          $("body").removeAttr("style");

          this.doctor_selected = null;
        }
      },
      error: (error) => {
        console.error('Error response:', error);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public searchData(value: any): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.usersList = this.dataSource.filteredData;
  }

  public sortData(sort: any) {
    const data = this.usersList.slice();

    if (!sort.active || sort.direction === '') {
      this.usersList = data;
    } else {
      this.usersList = data.sort((a: any, b: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aValue = (a as any)[sort.active];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  public getMoreData(event: string): void {
    if (event == 'next') {
      this.currentPage++;
      this.pageIndex = this.currentPage - 1;
      this.limit += this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableDataGeneral();
    } else if (event == 'previous') {
      this.currentPage--;
      this.pageIndex = this.currentPage - 1;
      this.limit -= this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableDataGeneral();
    }
  }

  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.skip = this.pageSelection[pageNumber - 1].skip;
    this.limit = this.pageSelection[pageNumber - 1].limit;
    if (pageNumber > this.currentPage) {
      this.pageIndex = pageNumber - 1;
    } else if (pageNumber < this.currentPage) {
      this.pageIndex = pageNumber + 1;
    }
    this.getTableDataGeneral();
  }

  public PageSize(): void {
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.searchDataValue = '';
    this.getTableDataGeneral();
  }

  private calculateTotalPages(totalData: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = totalData / pageSize;
    if (this.totalPages % 1 != 0) {
      this.totalPages = Math.trunc(this.totalPages + 1);
    }

    for (let i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({skip: skip, limit: limit});
    }
  }

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  openCreateTicketsModal(doctor: Doctor): void {
    console.log('doctor',doctor);
    this.selectedDoctorForTickets = doctor.id;
    this.showCreateTicketsModal = true;
  }

  onCloseTicketsModal(): void {
    this.showCreateTicketsModal = false;
    this.selectedDoctorForTickets = null;
  }

  onTicketsCreatedSuccess(): void {
    this.showSuccess('Cupos creados exitosamente');
  }

  onTicketsError(errorMessage: string): void {
    this.showError(errorMessage);
  }

  private showLoading() {
    this.isLoading = true;
  }

  private hideLoading() {
    this.isLoading = false;
  }

  showSuccess(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'success';
    this.showNotification = true;
  }

  showError(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;
  }

  onNotificationClose(): void {
    this.showNotification = false;
  }
}
