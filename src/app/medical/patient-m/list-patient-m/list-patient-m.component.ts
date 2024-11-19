import {Component, OnInit} from '@angular/core';
import {PatientMService} from '../service/patient-m.service';
import {MatTableDataSource} from '@angular/material/table';
import {Patient} from "../models/patient.model";

@Component({
  selector: 'app-list-patient-m',
  templateUrl: './list-patient-m.component.html',
  styleUrls: ['./list-patient-m.component.scss']
})
export class ListPatientMComponent implements OnInit {

  public patientsList: Patient[] = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public lastIndex = 0;
  public pageSize = 20;
  public totalData = 0;
  public skip = 0;//MIN
  public limit: number = this.pageSize;//MAX
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;
  public totalPagesArray: number[] = [];

  public patient_selected: any;
  public user: any;

  constructor(
    public patientService: PatientMService,
  ) {

  }

  ngOnInit() {
    this.getTableData(this.currentPage);
    this.user = this.patientService.authService.user;
  }

  isPermission(permission: string) {
    if (this.user.roles.includes('Super-Admin')) {
      return true;
    }
    return !!this.user.permissions.includes(permission);

  }

  calculateAge(birthDate: string, registrationDate: string): number {
    const birth = new Date(birthDate);
    const registration = new Date(registrationDate);
    let age = registration.getFullYear() - birth.getFullYear();
    const monthDiff = registration.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && registration.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses son 0-indexados
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private getTableData(page: number ): void {
    this.patientsList = [];
    this.serialNumberArray = [];

    this.patientService.listPatients(page).subscribe((resp: any) => {
      this.patientsList = resp.data;
      this.currentPage = resp.current_page;
      this.totalPages = resp.last_page;
      this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    })

  }

  selectUser(rol: any) {
    this.patient_selected = rol;
  }

  deletePatient() {

    this.patientService.deletePatient(this.patient_selected.id).subscribe((resp: any) => {
      console.log(resp);
      const INDEX = this.patientsList.findIndex((item: any) => item.id == this.patient_selected.id);
      if (INDEX != -1) {
        this.patientsList.splice(INDEX, 1);

        $('#delete_patient').hide();
        $("#delete_patient").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");

        this.patient_selected = null;
      }
    })
  }

  public changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.getTableData(page);
  }

  public sortData(sort: any) {
    const data = this.patientsList.slice();

    if (!sort.active || sort.direction === '') {
      this.patientsList = data;
    } else {
      this.patientsList = data.sort((a: any, b: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aValue = (a as any)[sort.active];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }
}
