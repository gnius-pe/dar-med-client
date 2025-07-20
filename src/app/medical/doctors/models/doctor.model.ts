export interface Speciality {
  id: number;
  name: string;
  state?: number;
}

export interface Role {
  id: number;
  name: string;
}

export interface DoctorFormData {
  name: string;
  surname: string;
  email: string;
  password?: string;
  phone?: string;
  birth_date: string;
  gender?: string;
  education?: string;
  designation?: string;
  address?: string;
  specialitie_id: number;
  role_id: number;
  state?: number;
  imagen?: File;
}

export interface DoctorCreateData {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone?: string;
  birth_date: string;
  gender?: string;
  education?: string;
  designation?: string;
  address?: string;
  specialitie_id: number;
  role_id: number;
  imagen?: File;
}

export interface DoctorUpdateData {
  name?: string;
  surname?: string;
  email?: string;
  password?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  education?: string;
  designation?: string;
  address?: string;
  specialitie_id?: number;
  role_id?: number;
  imagen?: File;
}

export interface Doctor {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  birth_date: string;
  gender?: string;
  education?: string;
  designation?: string;
  address?: string;
  avatar?: string;
  avatar_url?: string;
  specialitie_id: number;
  specialitie?: Speciality;
  state: number;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorListResponse {
  users: Doctor[];
}

export interface DoctorConfigResponse {
  roles: Role[];
  specialities: Speciality[];
}

export interface DoctorProfileStats {
  num_appointment: number;
  money_of_appointments: number;
  num_appointment_pendings: number;
}

export interface DoctorProfileResponse extends DoctorProfileStats {
  doctor: Doctor;
  appointment_pendings: any[];
  appointments: any[];
}

export interface DoctorShowResponse {
  doctor: Doctor;
}
