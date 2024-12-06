import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PatientMService} from '../service/patient-m.service';
import {MatTableDataSource} from '@angular/material/table';
import {Patient, PatientData} from "../models/patient.model";
import {jsPDF} from 'jspdf';

@Component({
  selector: 'app-list-patient-m',
  templateUrl: './list-patient-m.component.html',
  styleUrls: ['./list-patient-m.component.scss']
})
export class ListPatientMComponent implements OnInit {

  @ViewChild('qrCodeContainer', { static: false }) qrCodeContainer!: ElementRef;

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

  private getTableData(page: number): void {
    this.patientsList = [];
    this.serialNumberArray = [];

    this.patientService.listPatients(page).subscribe((resp: any) => {
      this.patientsList = resp.data;
      this.currentPage = resp.current_page;
      this.totalPages = resp.last_page;
      this.totalPagesArray = Array.from({length: this.totalPages}, (_, i) => i + 1);
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

  public printPatientData(patientId: string) {
    this.patientService.getPatientDataWithAppointments(patientId).subscribe({
      next: (patientData: PatientData) => {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [80, 300],
        });

        const marginLeft = 5;
        let y = 8;
        const lineHeight = 5;

        const img = new Image();
        img.src = 'assets/img/logo_ticket.png';
        img.onload = () => {
          doc.addImage(img, 'PNG', marginLeft, y, 70, 20);
          y += 22;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('Dirección de Asistencia Reformista', marginLeft, y);
          y += lineHeight;

          doc.setFontSize(9);
          doc.text('Misión: "Ancón 2024"', marginLeft, y);
          y += lineHeight;

          doc.setFontSize(8);
          doc.text(`REGISTRO: ANCON-001`, marginLeft, y);
          y += lineHeight;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Paciente:', marginLeft, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`${patientData.patient.name}`, marginLeft + 20, y);
          y += lineHeight;

          doc.text(`DNI: ${patientData.patient.identification_number}`, marginLeft, y);
          y += lineHeight;

          doc.text(`Celular: ${patientData.patient.first_phone}`, marginLeft, y);
          y += lineHeight;

          y += 3;
          doc.setFont('helvetica', 'bold');
          doc.text('PRE-DIAGNÓSTICO:', marginLeft, y);
          y += lineHeight;

          doc.setFont('helvetica', 'normal');
          if (patientData.patient.message) {
            const splitMessage = doc.splitTextToSize(patientData.patient.message, 70);
            doc.text(splitMessage, marginLeft, y);
            y += splitMessage.length * 3.5;
          } else {
            doc.text('No hay prediagnóstico disponible.', marginLeft, y);
            y += lineHeight;
          }

          y += 3;
          doc.setDrawColor(0);
          doc.setLineWidth(0.2);
          doc.line(marginLeft, y, 75, y);
          y += lineHeight;

          doc.setFont('helvetica', 'bold');
          doc.text('Citas Médicas:', marginLeft, y);
          y += lineHeight;

          patientData.appointments.forEach((appointment) => {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Especialidad: ${appointment.specialty}`, marginLeft, y);
            y += lineHeight;

            doc.text(`Doctor: ${appointment.doctor_name}`, marginLeft, y);
            y += lineHeight;

            doc.text(`Fecha: ${appointment.date}`, marginLeft, y);
            y += lineHeight;

            y += 2;
            doc.line(marginLeft, y, 75, y);
            y += lineHeight;
          });

          y += 4;
          const declaration =
            'Declaro estar de acuerdo con los servicios y autorizo el uso de mi imagen para fines de publicidad.';
          doc.setFontSize(6);
          const splitDeclaration = doc.splitTextToSize(declaration, 70);
          doc.text(splitDeclaration, marginLeft, y);
          y += splitDeclaration.length * 2.5; // Compactado

          y += 8;
          doc.setFontSize(9);
          doc.text('Nombre: _______________________', marginLeft, y);
          y += lineHeight;
          doc.text('DNI: __________________________', marginLeft, y);
          y += lineHeight;
          doc.text('Firma: ________________________', marginLeft, y);
          y += lineHeight;

          const qrCodeElement = this.qrCodeContainer.nativeElement.querySelector('canvas');
          if (qrCodeElement) {
            const qrDataUrl = qrCodeElement.toDataURL();
            y += 8;
            doc.addImage(qrDataUrl, 'PNG', marginLeft + 15, y, 40, 40);
            y += 42;
          }

          const bottomImg = new Image();
          bottomImg.src = 'assets/img/ticket_bottom.png';
          bottomImg.onload = () => {
            y += 5;
            doc.addImage(bottomImg, 'JPEG', marginLeft, y, 70, 20);
            y += 25;

            doc.setFontSize(8);
            doc.text('¡Gracias por asistir a Misiones DAR!', marginLeft, y);
            y += lineHeight;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(patientData.patient.name, marginLeft, y);

            doc.save(`Paciente_${patientData.patient.name}.pdf`);
          };
        };
      },
      error: (err) => {
        console.error('Error obteniendo los datos del paciente:', err);
      },
    });
  }
}
