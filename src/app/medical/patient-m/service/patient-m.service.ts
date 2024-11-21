import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PatientMService {

  private baseUrl = `${URL_SERVICIOS}/patients`;

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  listPatients(page = 1) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.token}`
    });
    const url = `${this.baseUrl}?page=${page}`;
    return this.http.get(url, { headers });
  }

  registerPatient(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/patients";
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
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/patients/"+staff_id;
    return this.http.delete(URL,{headers: headers});
  }

  profilePatient(staff_id:string){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/patients/profile/"+staff_id;
    return this.http.get(URL,{headers: headers});
  }

}
