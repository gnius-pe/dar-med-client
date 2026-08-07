import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PatientMService} from '../service/patient-m.service';
import {MatTableDataSource} from '@angular/material/table';
import {Patient} from "../models/patient.model";
import {PrintService} from "../../../shared/services/print.service";
import {ExportService, ColumnDefinition} from "../../../shared/services/export.service";
import {range, mergeMap, map, catchError, of, forkJoin, Observable} from 'rxjs';

@Component({
  selector: 'app-list-patient-m',
  templateUrl: './list-patient-m.component.html',
  styleUrls: ['./list-patient-m.component.scss']
})
export class ListPatientMComponent implements OnInit {

  @ViewChild('qrCodeContainer', {static: false}) qrCodeContainer!: ElementRef;

  patientsList: Patient[] = [];
  dataSource!: MatTableDataSource<any>;

  showFilter = false;
  searchDataValue = '';
  lastIndex = 0;
  pageSize = 20;
  totalData = 0;
  skip = 0;//MIN
  limit: number = this.pageSize;//MAX
  pageIndex = 0;
  serialNumberArray: Array<number> = [];
  currentPage = 1;
  pageNumberArray: Array<number> = [];
  pageSelection: Array<any> = [];
  totalPages = 0;
  totalPagesArray: number[] = [];

  patient_selected: any;
  user: any;

  isLoading = false;

  constructor(
    private patientService: PatientMService,
    private printService: PrintService,
    private exportService: ExportService,
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
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  public searchData() {
    this.getTableData(this.currentPage, this.searchDataValue);
  }

  private getTableData(page: number, search = ''): void {
    this.showLoading()
    this.patientService.listPatients(page, search).subscribe((resp: any) => {
      this.patientsList = resp.data;
      this.currentPage = resp.current_page;
      this.totalPages = resp.last_page;
      this.totalPagesArray = Array.from({length: this.totalPages}, (_, i) => i + 1);
      this.hideLoading()
    });
  }

  selectUser(rol: any) {
    this.patient_selected = rol;
  }

  deletePatient() {

    this.patientService.deletePatient(this.patient_selected.id).subscribe((resp: any) => {

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

  public printPatientData(patientId: string) {
    const qrCodeElement = this.qrCodeContainer?.nativeElement?.querySelector('canvas');
    this.printService.printPatientData(patientId, qrCodeElement).subscribe();
  }

  private showLoading() {
    this.isLoading = true;
  }

  private hideLoading() {
    this.isLoading = false;
  }

  exportToExcel(): void {
    this.showLoading();

    const totalPages = this.totalPages || 1;
    const currentPage = this.currentPage || 1;
    const search = this.searchDataValue || '';

    const pagesRequests: Observable<Patient[]>[] = [];

    for (let page = 1; page <= totalPages; page++) {
      if (page === currentPage) {
        pagesRequests.push(of(this.patientsList));
      } else {
        pagesRequests.push(
          this.patientService.listPatients(page, search).pipe(
            map((resp: any) => resp.data),
            catchError(() => of([] as Patient[]))
          )
        );
      }
    }

    forkJoin(pagesRequests).subscribe({
      next: (pagesData: Patient[][]) => {
        const allPatients = pagesData.flat();
        this.downloadExcel(allPatients);
        this.hideLoading();
      },
      error: () => {
        this.hideLoading();
      }
    });
  }

  private downloadExcel(patients: Patient[]): void {
    const columns: ColumnDefinition<Patient>[] = [
      { header: 'DNI', key: 'identification_number' },
      { header: 'Nombre', key: 'first_name' },
      { header: 'Apellido', key: 'last_name' },
      { header: 'Celular', key: 'first_phone' },
      { header: 'Teléfono 2', key: 'second_phone', transform: (v) => v || '' },
      { header: 'Correo', key: 'email', transform: (v) => v || '' },
      { header: 'Fecha de nacimiento', key: 'birth_date' },
      { header: 'Género', key: 'gender' },
      { header: 'Edad', key: 'birth_date', transform: (_, row) => this.calculateAge(row.birth_date, row.created_at) },
      { header: 'Fecha de registro', key: 'created_at', transform: (v) => this.formatDate(v) },
      { header: 'Examen médico', key: 'medical_examination', transform: (v) => v ? 'Sí' : 'No' },
      { header: 'Apoyo espiritual', key: 'spiritual_support', transform: (v) => v ? 'Sí' : 'No' },
      { header: 'Permiso de llamada', key: 'permission_to_call', transform: (v) => v ? 'Sí' : 'No' },
      { header: 'Mensaje', key: 'message', transform: (v) => v || '' },
      { header: 'Condición de visita', key: 'visit_condition', transform: (v) => v || '' },
      { header: 'Diagnóstico espiritual', key: 'spiritual_diagnosis', transform: (v) => v || '' },
    ];

    this.exportService.exportToExcel(patients, columns, 'pacientes');
  }
}
