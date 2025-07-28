import {Speciality} from "../../doctors/models/doctor.model";

export interface AppointmentCreateData {
  doctor_id: number;
  patient_id?: number;
  first_name: string;
  last_name: string;
  identification_number: string;
  first_phone?: string;
  name_companion?: string;
  surname_companion?: string;
  date_appointment: string;
  specialitie_id: number;
  amount?: number;
  amount_add?: number;
  method_payment?: string;
}

export interface AppointmentUpdateData {
  doctor_id?: number;
  date_appointment?: string;
  specialitie_id?: number;
  amount?: number;
  status?: number;
}

export interface AppointmentConfigResponse {
  specialities: Speciality[];
}

export interface AvailableDoctor {
  doctor: {
    id: number;
    full_name: string;
    specialitie: {
      id: number;
      name: string;
    };
    avatar_url?: string;
  };
  available_tickets: number;
  total_tickets: number;
  used_tickets: number;
  ticket_id: number;
}

export interface FilterDoctorsResponse {
  doctors: AvailableDoctor[];
  date_appointment: string;
  total_doctors: number;
}

export interface PatientSearchResponse {
  message: number;
  first_name?: string;
  last_name?: string;
  first_phone?: string;
  patient_id?: string;
  identification_number?: string;
}

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: number;
  date_appointment: string;
  specialitie_id: number;
  doctor_ticket_id?: number;
  amount?: number;
  status: number;
  status_pay: number;
  created_at: string;
  updated_at: string;
}
