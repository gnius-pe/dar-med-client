import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {URL_SERVICIOS} from 'src/app/config/config';
import {AuthService} from 'src/app/shared/auth/auth.service';
import {Observable} from "rxjs";
import {
  DoctorConfigResponse, DoctorCreateData,
  DoctorListResponse,
  DoctorProfileResponse,
  DoctorShowResponse, DoctorUpdateData
} from "../models/doctor.model";
import {ApiResponse} from "../../../shared/models/global.model";

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) {
  }

  listDoctors(): Observable<DoctorListResponse> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/doctors";
    return this.http.get<DoctorListResponse>(URL, {headers: headers});
  }

  listConfig(): Observable<DoctorConfigResponse> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/doctors/config";
    return this.http.get<DoctorConfigResponse>(URL, {headers: headers});
  }

  registerDoctor(data: DoctorCreateData | FormData): Observable<ApiResponse> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/doctors";
    return this.http.post<ApiResponse>(URL, data, {headers: headers});
  }

  showDoctor(doctor_id: string): Observable<DoctorShowResponse> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/doctors/" + doctor_id;
    return this.http.get<DoctorShowResponse>(URL, {headers: headers});
  }

  updateDoctor(doctor_id: string, data: DoctorUpdateData | FormData): Observable<ApiResponse> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/doctors/" + doctor_id;
    return this.http.post<ApiResponse>(URL, data, {headers: headers});
  }

  updateDoctorProfile(doctor_id: string, data: DoctorUpdateData): Observable<ApiResponse> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/staffs/" + doctor_id;
    return this.http.post<ApiResponse>(URL, data, {headers: headers});
  }

  deleteDoctor(doctor_id: string): Observable<ApiResponse> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/doctors/" + doctor_id;
    return this.http.delete<ApiResponse>(URL, {headers: headers});
  }

  profileDoctor(doctor_id: string): Observable<DoctorProfileResponse> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/doctors/profile/" + doctor_id;
    return this.http.get<DoctorProfileResponse>(URL, {headers: headers});
  }
}
