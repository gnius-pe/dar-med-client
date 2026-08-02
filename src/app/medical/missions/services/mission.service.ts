import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {URL_SERVICIOS} from 'src/app/config/config';
import {AuthService} from 'src/app/shared/auth/auth.service';
import {Mission} from '../models/mission.model';

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) {
  }

  listMissions(): Observable<any> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/missions";
    return this.http.get(URL, {headers: headers});
  }

  registerMission(data: Mission): Observable<any> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/missions";
    return this.http.post(URL, data, {headers: headers});
  }

  showMission(mission_id: string): Observable<any> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/missions/" + mission_id;
    return this.http.get(URL, {headers: headers});
  }

  updateMission(mission_id: string, data: Mission): Observable<any> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/missions/" + mission_id;
    return this.http.put(URL, data, {headers: headers});
  }

  deleteMission(mission_id: string): Observable<any> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    const URL = URL_SERVICIOS + "/missions/" + mission_id;
    return this.http.delete(URL, {headers: headers});
  }
}
