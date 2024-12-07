export interface Patient {
  id: number;
  identification_type: string;
  identification_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  birth_date: string;
  first_phone: string;
  second_phone?: string;
  gender: string;
  message?: string;
  visit_condition?: string;
  spiritual_diagnosis?: string;
  medical_examination: boolean;
  spiritual_support: boolean;
  permission_to_call: boolean;
  created_at: string;
}

export interface PatientData {
  patient: {
    id: number;
    name: string;
    email: string;
    birth_date: string;
    first_phone: string;
    second_phone?: string;
    gender: string;
    identification_number: string;
    message?: string;
    spiritual_support: boolean;
    medical_examination: boolean;
    permission_to_call: boolean;
  };
  appointments: {
    id: number;
    date: string;
    status: number;
    status_pay: number;
    amount?: string;
    doctor_name: string;
    specialty: string;
  }[];
}

export interface GeographicLocation {
  id: number;
  country: string;
  department: string;
  province: string;
  district: string;
  address: string;
  reference?: string;
  patient_id: number;
}


