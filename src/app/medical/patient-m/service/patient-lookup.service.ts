import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface PatientLookupResponse {
  document_type: string;
  document_number: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PatientLookupService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.token}`,
    });
  }

  lookupDni(dni: string): Observable<PatientLookupResponse | null> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/patients/lookup/dni?dni=${encodeURIComponent(dni)}`;
    return this.http.get<any>(url, { headers }).pipe(
      map((resp: any) => resp?.data ?? null),
      catchError(() => of(null))
    );
  }
}
