import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {URL_SERVICIOS} from 'src/app/config/config';
import {AuthService} from 'src/app/shared/auth/auth.service';
import {Observable, forkJoin, from, map} from 'rxjs';
import {GeographicLocation} from "../models/patient.model";

@Injectable({
  providedIn: 'root'
})
export class GeographicLocationService {

  private baseUrl = `${URL_SERVICIOS}/geographic-locations`;

  public nationalities: any[] = [];
  public departments: any[] = [];
  public provinces: any[] = [];
  public districts: any[] = [];

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

  getByPatientIds(patientIds: number[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.token}`
    });
    return this.http.post(`${this.baseUrl}/by-patient-ids`, { patient_ids: patientIds }, { headers });
  }

  loadNationalities(): Promise<void> {
    return this.http.get('/assets/locations/nacionalidades.json').toPromise().then((data: any) => {
      this.nationalities = data;
    });
  }

  loadDepartments(): Promise<void> {
    return this.http.get('/assets/locations/departamentos.json').toPromise().then((data: any) => {
      this.departments = data;
    });
  }

  loadProvinces(): Promise<void> {
    return this.http.get('/assets/locations/provincias.json').toPromise().then((data: any) => {
      this.provinces = data;
    });
  }

  loadDistricts(): Promise<void> {
    return this.http.get('/assets/locations/distritos.json').toPromise().then((data: any) => {
      this.districts = data;
    });
  }

  loadLocationCatalogs(): Observable<void> {
    return forkJoin({
      nationalities: from(this.loadNationalities()),
      departments: from(this.loadDepartments()),
      provinces: from(this.loadProvinces()),
      districts: from(this.loadDistricts()),
    }).pipe(
      map(() => undefined)
    );
  }

  getNationalityName(countryId: any): string {
    if (!countryId && countryId !== 0) return '';
    const id = Number(countryId);
    const item = this.nationalities.find((n: any) => Number(n.id) === id || Number(n.userId) === id);
    return item?.title || item?.name || '';
  }

  getDepartmentName(departmentId: any): string {
    if (!departmentId && departmentId !== 0) return '';
    const id = String(departmentId);
    const item = this.departments.find((d: any) => String(d.id) === id);
    return item?.name || '';
  }

  getProvinceName(provinceId: any): string {
    if (!provinceId && provinceId !== 0) return '';
    const id = String(provinceId);
    const item = this.provinces.find((p: any) => String(p.id) === id);
    return item?.name || '';
  }

  getDistrictName(districtId: any): string {
    if (!districtId && districtId !== 0) return '';
    const id = String(districtId);
    const item = this.districts.find((d: any) => String(d.id) === id);
    return item?.name || '';
  }
}
