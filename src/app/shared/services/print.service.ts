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

  /**
   * Imprime los datos del paciente con sus citas médicas
   * @param patientId ID del paciente
   * @param qrCodeElement Elemento canvas del código QR (opcional)
   * @returns Observable<boolean> - true si se imprimió correctamente
   */
  printPatientData(patientId: string, qrCodeElement?: HTMLCanvasElement): Observable<boolean> {
    return new Observable(observer => {
      this.resolveActiveMissionName().pipe(
        switchMap((missionName) => this.patientService.getPatientDataWithAppointments(patientId).pipe(
          map((patientData: PatientData) => ({ patientData, missionName }))
        ))
      ).subscribe({
        next: ({ patientData, missionName }) => {
          try {
            this.generatePDF(patientData, missionName, qrCodeElement);
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
    });
  }

  /**
   * Imprime datos del paciente usando datos ya obtenidos
   * @param patientData Datos del paciente con citas
   * @param qrCodeElement Elemento canvas del código QR (opcional)
   */
  printPatientDataDirect(patientData: PatientData, qrCodeElement?: HTMLCanvasElement): void {
    this.resolveActiveMissionName().subscribe({
      next: (missionName) => this.generatePDF(patientData, missionName, qrCodeElement),
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

  /**
   * Genera el PDF con los datos del paciente
   * @param patientData Datos del paciente
   * @param missionName Nombre de la misión
   * @param qrCodeElement Elemento canvas del código QR
   */
  private generatePDF(patientData: PatientData, missionName: string, qrCodeElement?: HTMLCanvasElement): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 300],
    });

    const marginLeft = 3;
    let y = 8;
    const lineHeight = 5;

    // Cargar logo principal
    const img = new Image();
    img.src = 'assets/img/logo_ticket.png';

    img.onload = () => {
      // Logo principal
      const imgWidth = 70;
      const imgAspectRatio = img.width / img.height;
      const imgHeight = imgWidth / imgAspectRatio;

      doc.addImage(img, 'PNG', marginLeft, y, imgWidth, imgHeight);
      y += imgHeight + 5;

      // Header información
      this.addHeader(doc, marginLeft, y, lineHeight, missionName);
      y = this.getYAfterHeader(y, lineHeight);

      // Datos del paciente
      y = this.addPatientData(doc, patientData, marginLeft, y, lineHeight);

      // Pre-diagnóstico
      y = this.addPreDiagnosis(doc, patientData, marginLeft, y, lineHeight);

      // Citas médicas
      y = this.addAppointments(doc, patientData, marginLeft, y, lineHeight);

      // Sección Profesionales
      y = this.addProfessionalSection(doc, marginLeft, y, lineHeight);

      // Declaración
      y = this.addDeclaration(doc, marginLeft, y, lineHeight);

      // Campos de firma y texto de escaneo (Se envía patientData para llenar datos automáticos)
      y = this.addSignatureFields(doc, patientData, marginLeft, y, lineHeight);

      // Código QR (si existe)
      if (qrCodeElement) {
        y = this.addQRCode(doc, qrCodeElement, marginLeft, y);
      }

      // Imagen del footer y finalización
      this.addFooterAndSave(doc, patientData, marginLeft, y, lineHeight);
    };

    img.onerror = () => {
      console.warn('No se pudo cargar el logo principal, continuando sin él...');
      // Continuar sin logo si hay error
      this.generatePDFWithoutMainLogo(doc, patientData, missionName, marginLeft, y, lineHeight, qrCodeElement);
    };
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

      // 1. Escribimos "Especialidad: " en letra normal
      doc.setFont('helvetica', 'normal');
      doc.text('Especialidad: ', marginLeft, y);
      
      // Calculamos el ancho de "Especialidad: " para saber dónde empezar a escribir el nombre
      const labelWidth = doc.getTextWidth('Especialidad: ');

      // 2. Escribimos SOLO el nombre de la especialidad (ej. Medicina) en negrita justo al lado
      doc.setFont('helvetica', 'bold');
      doc.text(specialty, marginLeft + labelWidth, y);
      y += lineHeight;

      // El doctor y la fecha continúan en texto normal
      doc.setFont('helvetica', 'normal');
      doc.text(`Doctor: ${doctorName}`, marginLeft, y);
      y += lineHeight;

      doc.text(`Fecha: ${appointmentDate}`, marginLeft, y);
      y += lineHeight;

      y += 2;
      // Esta línea separa la sección de citas de la sección de profesionales
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
    doc.setFont("helvetica", "bold"); // Lo puse en negrita para resaltar como título
    // Se centra a 40 (mitad de 80mm) con la alineación 'center'
    doc.text('CONOCE MÁS DE NOSOTROS:', 40, y, { align: 'center' });

    // Reduje el espacio en blanco antes de regresar el Y para acercarlo al QR
    return y + 2;
  }

  private addQRCode(doc: jsPDF, qrCodeElement: HTMLCanvasElement, marginLeft: number, y: number): number {
    const qrDataUrl = qrCodeElement.toDataURL();
    y += 2; // Reduje el espacio antes de imprimir la imagen
    
    // Posición X fija a 20 para centrar la imagen exacta ( (80 total - 40 ancho qr) / 2 = 20 )
    doc.addImage(qrDataUrl, 'PNG', 20, y, 40, 40);
    y += 42;

    return y;
  }

  private addFooterAndSave(doc: jsPDF, patientData: PatientData, marginLeft: number, y: number, lineHeight: number): void {
    const bottomImg = new Image();
    bottomImg.src = 'assets/img/ticket_bottom.png';

    bottomImg.onload = () => {
      y += 5;

      const imgWidth = 70;
      const imgAspectRatio = bottomImg.width / bottomImg.height;
      const imgHeight = imgWidth / imgAspectRatio;

      doc.addImage(bottomImg, 'JPEG', marginLeft, y, imgWidth, imgHeight);
      y += imgHeight + 5;

      doc.setFontSize(8);
      doc.text('¡Gracias por asistir a Misiones DAR!', marginLeft, y);
      y += lineHeight;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(patientData.patient.name, marginLeft, y);

      const safeFileName = this.sanitizeFileName(patientData.patient.name);
      doc.save(`Paciente_${safeFileName}.pdf`);
    };

    bottomImg.onerror = () => {
      console.warn('No se pudo cargar la imagen del footer, guardando PDF sin ella...');
      const safeFileName = this.sanitizeFileName(patientData.patient.name);
      doc.save(`Paciente_${safeFileName}.pdf`);
    };
  }

  private generatePDFWithoutMainLogo(doc: jsPDF, patientData: PatientData, missionName: string, marginLeft: number, y: number, lineHeight: number, qrCodeElement?: HTMLCanvasElement): void {
    this.addHeader(doc, marginLeft, y, lineHeight, missionName);
    y = this.getYAfterHeader(y, lineHeight);

    y = this.addPatientData(doc, patientData, marginLeft, y, lineHeight);
    y = this.addPreDiagnosis(doc, patientData, marginLeft, y, lineHeight);
    y = this.addAppointments(doc, patientData, marginLeft, y, lineHeight);
    y = this.addProfessionalSection(doc, marginLeft, y, lineHeight);
    y = this.addDeclaration(doc, marginLeft, y, lineHeight);
    y = this.addSignatureFields(doc, patientData, marginLeft, y, lineHeight);

    if (qrCodeElement) {
      y = this.addQRCode(doc, qrCodeElement, marginLeft, y);
    }

    this.addFooterAndSave(doc, patientData, marginLeft, y, lineHeight);
  }
}