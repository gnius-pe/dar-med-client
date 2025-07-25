import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {URL_SERVICIOS} from 'src/app/config/config';
import {AuthService} from 'src/app/shared/auth/auth.service';
import {Observable} from "rxjs";
import {ApiResponse} from "../../../shared/models/global.model";
import {
  AppointmentConfigResponse,
  AppointmentCreateData,
  AppointmentUpdateData,
  FilterDoctorsResponse,
  PatientSearchResponse
} from "../models/appointment.model";

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  listConfig(): Observable<AppointmentConfigResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + "/appointmet/config";
    return this.http.get<AppointmentConfigResponse>(URL, { headers });
  }

  filterDoctors(data: { date_appointment: string; specialitie_id?: number }): Observable<FilterDoctorsResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + "/appointmet/filter";
    return this.http.post<FilterDoctorsResponse>(URL, data, { headers });
  }

  searchPatient(identification_number: string): Observable<PatientSearchResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + `/appointmet/patient?identification_number=${identification_number}`;
    return this.http.get<PatientSearchResponse>(URL, { headers });
  }

  createAppointment(data: AppointmentCreateData): Observable<ApiResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + "/appointmet";
    return this.http.post<ApiResponse>(URL, data, { headers });
  }

  listAppointments(page = 1, search = '', specialitie_id = '', date = null): Observable<any> {
    const headers = this.getHeaders();
    let LINK = "";
    if (search) {
      LINK += "&search=" + search;
    }
    if (specialitie_id) {
      LINK += "&specialitie_id=" + specialitie_id;
    }
    if (date) {
      LINK += "&date=" + date;
    }
    const URL = URL_SERVICIOS + "/appointmet?page=" + page + LINK;
    return this.http.get(URL, { headers });
  }

  updateAppointment(appointmentId: string, data: AppointmentUpdateData): Observable<ApiResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + `/appointmet/${appointmentId}`;
    return this.http.put<ApiResponse>(URL, data, { headers });
  }

  deleteAppointment(appointmentId: string): Observable<ApiResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + `/appointmet/${appointmentId}`;
    return this.http.delete<ApiResponse>(URL, { headers });
  }

  showAppointment(appointmentId: string): Observable<any> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + `/appointmet/${appointmentId}`;
    return this.http.get(URL, { headers });
  }
}
