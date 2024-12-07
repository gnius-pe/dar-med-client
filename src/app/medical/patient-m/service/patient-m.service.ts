import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';
import {PatientData} from "../models/patient.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PatientMService {

  private baseUrl = `${URL_SERVICIOS}/patients`;
  private pdfServiceUrl = 'http://localhost:8080/generate-pdf';

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  listPatients(page = 1, search = '') {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.token}`,
    });

    const url = `${this.baseUrl}?page=${page}&search=${encodeURIComponent(search)}`;

    return this.http.get(url, { headers });
  }

  registerPatient(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = URL_SERVICIOS+"/patients";
    return this.http.post(URL,data,{headers: headers});
  }

  showPatient(patient_id:string){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = URL_SERVICIOS+"/patients/"+patient_id;
    return this.http.get(URL,{headers: headers});
  }

  updatePatient(staff_id:string,data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = URL_SERVICIOS+"/patients/"+staff_id;
    return this.http.post(URL,data,{headers: headers});
  }

  deletePatient(staff_id:string){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = URL_SERVICIOS+"/patients/"+staff_id;
    return this.http.delete(URL,{headers: headers});
  }

  profilePatient(staff_id:string){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = URL_SERVICIOS+"/patients/profile/"+staff_id;
    return this.http.get(URL,{headers: headers});
  }

  getPatientDataWithAppointments(patientId: string): Observable<PatientData> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.token}`,
    });
    const url = `${this.baseUrl}/${patientId}/data`;
    return this.http.get<PatientData>(url, { headers });
  }

  generatePDF(patientData: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.token}`,
    });
    return this.http.post(this.pdfServiceUrl, patientData, {
      headers,
      responseType: 'blob',
    });
  }

}
