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
