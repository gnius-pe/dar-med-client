import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../../shared/auth/auth.service";
import {Observable} from "rxjs";
import {
  BulkCreateTicketRequest,
  CreateTicketRequest,
  DoctorTicketConfigResponse,
  DoctorTicketResponse,
  DoctorTicketsListResponse
} from "./ticket.model";
import {URL_SERVICIOS} from "../../config/config";
import {ApiResponse} from "../../shared/models/global.model";

@Injectable({
  providedIn: 'root'
})
export class DoctorTicketService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  // Obtener configuración
  getConfig(): Observable<DoctorTicketConfigResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + "/doctor-tickets/config";
    return this.http.get<DoctorTicketConfigResponse>(URL, { headers });
  }

  // Listar doctores para gestión
  listDoctors(): Observable<DoctorTicketsListResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + "/doctor-tickets";
    return this.http.get<DoctorTicketsListResponse>(URL, { headers });
  }

  // Obtener tickets de un doctor
  getDoctorTickets(doctorId: number, startDate?: string, endDate?: string): Observable<DoctorTicketResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + `/doctor-tickets/${doctorId}`;

    let params = '';
    if (startDate) params += `?start_date=${startDate}`;
    if (endDate) params += `${startDate ? '&' : '?'}end_date=${endDate}`;

    return this.http.get<DoctorTicketResponse>(URL + params, { headers });
  }

  // Crear tickets individuales
  createTickets(data: CreateTicketRequest): Observable<ApiResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + "/doctor-tickets";
    return this.http.post<ApiResponse>(URL, data, { headers });
  }

  // Crear tickets masivos
  bulkCreateTickets(data: BulkCreateTicketRequest): Observable<ApiResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + "/doctor-tickets/bulk-create";
    return this.http.post<ApiResponse>(URL, data, { headers });
  }

  // Actualizar ticket
  updateTicket(ticketId: number, data: { total_tickets: number; is_active?: boolean }): Observable<ApiResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + `/doctor-tickets/${ticketId}`;
    return this.http.put<ApiResponse>(URL, data, { headers });
  }

  // Eliminar ticket
  deleteTicket(ticketId: number): Observable<ApiResponse> {
    const headers = this.getHeaders();
    const URL = URL_SERVICIOS + `/doctor-tickets/${ticketId}`;
    return this.http.delete<ApiResponse>(URL, { headers });
  }
}
