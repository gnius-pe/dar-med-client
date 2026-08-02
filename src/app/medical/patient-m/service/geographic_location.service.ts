import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {URL_SERVICIOS} from 'src/app/config/config';
import {AuthService} from 'src/app/shared/auth/auth.service';
import {Observable} from 'rxjs';
import {GeographicLocation} from "../models/patient.model";

@Injectable({
  providedIn: 'root'
})
export class GeographicLocationService {

  private baseUrl = `${URL_SERVICIOS}/geographic-locations`;

  constructor(
    public http: HttpClient,
    public authService: AuthService
  ) {
  }

  registerLocation(data: GeographicLocation): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.token}`
    });
    return this.http.post(this.baseUrl, data, {headers});
  }

  public updateLocation(locationId: number, data: GeographicLocation): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.token}`,
    });
    const url = `${this.baseUrl}/${locationId}`;
    return this.http.put(url, data, { headers });
  }

  getLocationByPatient(patientId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.token}`
    });
    const url = `${this.baseUrl}/patient/${patientId}`;
    return this.http.get(url, {headers});
  }
}
