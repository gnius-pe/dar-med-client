import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Observable, of, switchMap, map } from 'rxjs';
import {PatientData} from "../../medical/patient-m/models/patient.model";
import {SelectedMissionService} from "../../medical/missions/services/selected-mission.service";
import {PatientMService} from "../../medical/patient-m/service/patient-m.service";

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor(
    private selectedMissionService: SelectedMissionService,
    private patientService: PatientMService
  ) {}

  printPatientData(patientId: string, qrCodeElement?: HTMLCanvasElement): Observable<boolean> {
    return new Observable(observer => {
      const innerSubscription = this.resolveActiveMissionName().pipe(
        switchMap((missionName) => this.patientService.getPatientDataWithAppointments(patientId).pipe(
          map((patientData: PatientData) => ({ patientData, missionName }))
        ))
      ).subscribe({
        next: async ({ patientData, missionName }) => {
          try {
            await this.generatePDF(patientData, missionName, qrCodeElement);
            observer.next(true);
            observer.complete();
          } catch (error) {
            console.error('Error generando PDF:', error);
            observer.error(error);
          }
        },
        error: (err) => {
          console.error('Error obteniendo los datos del paciente:', err);
          observer.error(err);
        }
      });

      observer.add(innerSubscription);
    });
  }

  printPatientDataDirect(patientData: PatientData, qrCodeElement?: HTMLCanvasElement): void {
    this.resolveActiveMissionName().subscribe({
      next: async (missionName) => {
        try {
          await this.generatePDF(patientData, missionName, qrCodeElement);
        } catch (error) {
          console.error('Error:', error);
        }
      },
      error: (error) => console.error('Error resolviendo la misión activa:', error)
    });
  }

  private resolveActiveMissionName(): Observable<string> {
    const selectedMission = this.selectedMissionService.getSelectedMission();

    if (selectedMission?.name) {
      return of(selectedMission.name);
    }

    return of('');
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/g, '').trim() || 'sin_nombre';
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }

  private async generatePDF(patientData: PatientData, missionName: string, qrCodeElement?: HTMLCanvasElement): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 400],
    });

    const marginLeft = 3;
    let y = 8;
    const lineHeight = 5;

    try {
      const img = await this.loadImage('assets/img/logo_ticket.png');
      const imgWidth = 70;
      const imgAspectRatio = img.width / img.height;
      const imgHeight = imgWidth / imgAspectRatio;

      doc.addImage(img, 'PNG', marginLeft, y, imgWidth, imgHeight);
      y += imgHeight + 5;
    } catch (error) {
      console.warn('No se pudo cargar el logo principal, continuando sin él...');
    }

    this.addHeader(doc, marginLeft, y, lineHeight, missionName);
    y = this.getYAfterHeader(y, lineHeight);
    y = this.addPatientData(doc, patientData, marginLeft, y, lineHeight);
    y = this.addPreDiagnosis(doc, patientData, marginLeft, y, lineHeight);
    y = this.addAppointments(doc, patientData, marginLeft, y, lineHeight);
    y = this.addProfessionalSection(doc, marginLeft, y, lineHeight);
    y = this.addDeclaration(doc, marginLeft, y, lineHeight);
    y = this.addSignatureFields(doc, patientData, marginLeft, y, lineHeight);

    y = await this.addQRCode(doc, marginLeft, y);

    await this.addFooterAndSave(doc, patientData, marginLeft, y, lineHeight);
  }

  private addHeader(doc: jsPDF, marginLeft: number, y: number, lineHeight: number, missionName: string): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Dirección de Asistencia Reformista', marginLeft, y);
    y += lineHeight;

    doc.setFontSize(9);
    doc.text(`Misión: "${missionName}"`, marginLeft, y);
    y += lineHeight;
  }

  private getYAfterHeader(y: number, lineHeight: number): number {
    return y + (lineHeight * 3);
  }

  private addPatientData(doc: jsPDF, patientData: PatientData, marginLeft: number, y: number, lineHeight: number): number {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Paciente:', marginLeft, y);
    y += lineHeight;

    doc.setFont('helvetica', 'normal');
    const splitName = doc.splitTextToSize(patientData.patient.name, 65);
    doc.text(splitName, marginLeft, y);
    y += splitName.length * lineHeight;

    doc.text(`DNI: ${patientData.patient.identification_number}`, marginLeft, y);
    y += lineHeight;

    doc.text(`Celular: ${patientData.patient.first_phone}`, marginLeft, y);
    y += lineHeight;

    return y;
  }

  private addPreDiagnosis(doc: jsPDF, patientData: PatientData, marginLeft: number, y: number, lineHeight: number): number {
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

    return y;
  }

  private addAppointments(doc: jsPDF, patientData: PatientData, marginLeft: number, y: number, lineHeight: number): number {
    y += 3;
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(marginLeft, y, 75, y);
    y += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Citas Médicas:', marginLeft, y);
    y += lineHeight;

    if (!patientData.appointments || patientData.appointments.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('No hay citas médicas registradas.', marginLeft, y);
      y += lineHeight;
      return y;
    }

    patientData.appointments.forEach((appointment) => {
      doc.setFontSize(8);
      
      const specialty = appointment.specialty || 'No especificada';
      const doctorName = appointment.doctor_name || 'No asignado';
      const appointmentDate = appointment.date || 'Sin fecha';

      doc.setFont('helvetica', 'normal');
      doc.text('Especialidad: ', marginLeft, y);
      
      const labelWidth = doc.getTextWidth('Especialidad: ');

      doc.setFont('helvetica', 'bold');
      doc.text(specialty, marginLeft + labelWidth, y);
      y += lineHeight;

      doc.setFont('helvetica', 'normal');
      doc.text(`Doctor: ${doctorName}`, marginLeft, y);
      y += lineHeight;

      doc.text(`Fecha: ${appointmentDate}`, marginLeft, y);
      y += lineHeight;

      y += 2;
      doc.line(marginLeft, y, 75, y); 
      y += lineHeight;
    });

    return y;
  }

  private addProfessionalSection(doc: jsPDF, marginLeft: number, y: number, lineHeight: number): number {
    doc.setLineWidth(0.2);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text('A COMPLETAR POR LOS PROFESIONALES:', marginLeft, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text('PESO: ______', marginLeft, y);
    doc.text('ALTURA: ______', marginLeft + 17, y);
    doc.text('P.A: ______', marginLeft + 36, y);
    doc.text('HORARIO: ______', marginLeft + 51, y);
    
    y += 6; 
    return y;
  }

  private addDeclaration(doc: jsPDF, marginLeft: number, y: number, lineHeight: number): number {
    const declaration = 'DECLARO A TODOS LOS EFECTOS QUE ESTOY DE ACUERDO CON TODOS LOS SERVICIOS EN LOS QUE PARTICIPARÉ Y QUE AUTORIZO EL USO DE MI IMAGEN (EN FOTOGRAFÍA O VIDEO) EN LA PUBLICIDAD DEL TRABAJO REALIZADO POR LA ENTIDAD, SIN CARGA ALGUNA PARA ÉSTA.';
    
    doc.setFontSize(6);
    const splitDeclaration = doc.splitTextToSize(declaration, 70); 
    doc.text(splitDeclaration, marginLeft, y);
    
    y += splitDeclaration.length * 2.5; 
    return y;
  }

  private addSignatureFields(doc: jsPDF, patientData: PatientData, marginLeft: number, y: number, lineHeight: number): number {
    y += 4;
    doc.setFontSize(7);
    
    doc.text(`NOMBRE: ${patientData.patient.name}`, marginLeft, y);
    y += lineHeight + 1;
    
    doc.text(`DNI: ${patientData.patient.identification_number}`, marginLeft, y);
    doc.text('FIRMA: ___________________', marginLeft + 35, y); 
    
    y += 6;

    doc.setLineWidth(0.2);
    doc.line(marginLeft, y, 75, y);
    
    y += 5;
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold"); 
    doc.text('CONOCE MÁS DE NOSOTROS:', 40, y, { align: 'center' });

    return y + 2;
  }

  private async addQRCode(doc: jsPDF, marginLeft: number, y: number): Promise<number> {
    y += 3; 
    try {
      const qrImg = await this.loadImage('assets/img/qr-DAR.png');
      const qrWidth = 60; 
      const qrHeight = qrWidth / (qrImg.width / qrImg.height);
      const xPos = (80 - qrWidth) / 2;

      doc.addImage(qrImg, 'PNG', xPos, y, qrWidth, qrHeight);
      y += qrHeight + 2; 
    } catch (error) {
      console.warn('No se pudo cargar el código QR, continuando sin él...');
      y += 42; 
    }
    
    return y;
  }

  private async addFooterAndSave(doc: jsPDF, patientData: PatientData, marginLeft: number, y: number, lineHeight: number): Promise<void> {
    try {
      const bottomImg = await this.loadImage('assets/img/ticket_bottom.png');
      y += 5;
      const footerWidth = 70;
      const footerAspectRatio = bottomImg.width / bottomImg.height;
      const footerHeight = footerWidth / footerAspectRatio;

      doc.addImage(bottomImg, 'JPEG', marginLeft, y, footerWidth, footerHeight);
      y += footerHeight + 5;
    } catch (error) {
      console.warn('No se pudo cargar la imagen del footer, continuando sin ella...');
    }

    try {
      const starImg = await this.loadImage('assets/img/noche-estelar.png');
      const starWidth = 70;
      const starAspectRatio = starImg.width / starImg.height;
      const starHeight = starWidth / starAspectRatio;

      doc.addImage(starImg, 'PNG', marginLeft, y, starWidth, starHeight);
      y += starHeight + 5;
    } catch (error) {
      console.warn('No se pudo cargar la imagen noche-estelar.');
    }

    // Restaurado EXACTAMENTE a tu código original (sin cambios de fuente)
    doc.setFontSize(8);
    doc.text('¡Gracias por asistir a Misiones DAR!', marginLeft, y);
    y += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(patientData.patient.name, marginLeft, y);

    const safeFileName = this.sanitizeFileName(patientData.patient.name);
    doc.save(`Paciente_${safeFileName}.pdf`);
  }
}