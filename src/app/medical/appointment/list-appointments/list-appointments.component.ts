import {Component, OnInit} from '@angular/core';
import { AppointmentService } from '../service/appointment.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-list-appointments',
  templateUrl: './list-appointments.component.html',
  styleUrls: ['./list-appointments.component.scss']
})
export class ListAppointmentsComponent implements OnInit{
  public appointmentList:any = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public specialitie_id = '';
  public date = null;
  public lastIndex = 0;
  pageSize = 20;
  totalData = 0;
  totalPages = 0;
  currentPage = 1;
  totalPagesArray: number[] = [];
  serialNumberArray: Array<number> = [];

  public patient_generals:any = [];
  public appointment_selected:any;

  specialities:any = [];
  public user:any;
  constructor(
    public appointmentService: AppointmentService,
  ){

  }
  ngOnInit() {

    this.getTableData();

    this.appointmentService.listConfig().subscribe((resp:any) => {
      this.specialities = resp.specialities;
    })
    this.user = this.appointmentService.authService.user;
  }

  isPermitted(){
    let band = false;
    this.user.roles.forEach((rol:any) => {
      if((rol).toUpperCase().indexOf("DOCTOR") != -1){
        band = true;
      }
    });
    return band;
  }

  isPermission(permission:string){

    if(this.user.roles.includes('Super-Admin')){
      return true;
    }

    return !!this.user.permissions.includes(permission);
  }

  private getTableData(page = 1): void {
    this.appointmentList = [];
    this.serialNumberArray = [];

    this.appointmentService.listAppointments(page, this.searchDataValue, this.specialitie_id, this.date).subscribe((resp: any) => {

      this.totalData = resp.total;
      this.appointmentList = resp.appointments.data;

      this.dataSource = new MatTableDataSource<any>(this.appointmentList);
      this.currentPage = resp.appointments.pagination.current_page;
      this.totalPages = resp.appointments.pagination.last_page;
      this.totalPagesArray = Array.from({length: this.totalPages}, (_, i) => i + 1);
    });
  }

  selectUser(rol:any){
    this.appointment_selected = rol;
  }

  deleteAppointment(){

    this.appointmentService.deleteAppointment(this.appointment_selected.id).subscribe((resp:any) => {

      let INDEX = this.appointmentList.findIndex((item:any) => item.id == this.appointment_selected.id);
      if(INDEX != -1){
        this.appointmentList.splice(INDEX,1);

        $('#delete_patient').hide();
        $("#delete_patient").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");

        this.appointment_selected = null;
      }
    })
  }
  public searchData() {
    this.totalPagesArray = [];
    this.currentPage = 1;
    this.getTableData();
  }

  public sortData(sort: any) {
    const data = this.appointmentList.slice();

    if (!sort.active || sort.direction === '') {
      this.appointmentList = data;
    } else {
      this.appointmentList = data.sort((a:any, b:any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aValue = (a as any)[sort.active];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  public changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.getTableData(page);
  }

  public clearFilters(): void {
    this.totalPagesArray = [];
    this.currentPage = 1;
    this.searchDataValue = '';
    this.specialitie_id = '';
    this.date = null;
    this.getTableData();
  }

  private calculateTotalPages(totalData: number, pageSize: number): void {
    this.totalPagesArray = [];
    this.totalPages = totalData / pageSize;
    if (this.totalPages % 1 != 0) {
      this.totalPages = Math.trunc(this.totalPages + 1);
    }
    this.totalPagesArray = Array.from({length: this.totalPages}, (_, i) => i + 1);
  }
}
