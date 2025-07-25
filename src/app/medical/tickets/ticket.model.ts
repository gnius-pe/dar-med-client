export interface DoctorTicket {
  id: number;
  doctor_id: number;
  available_date: string;
  available_date_formatted: string;
  day_name: string;
  total_tickets: number;
  used_tickets: number;
  available_tickets: number;
  utilization_percentage: number;
  is_active: boolean;
}

export interface DoctorTicketStats {
  total_tickets: number;
  used_tickets: number;
  available_tickets: number;
  utilization_percentage: number;
  active_dates: number;
}

export interface DoctorTicketResponse {
  doctor: {
    id: number;
    full_name: string;
    specialitie: any;
  };
  tickets: DoctorTicket[];
  stats: DoctorTicketStats;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface DoctorTicketConfigResponse {
  specialities: any[];
}

export interface DoctorTicketsListResponse {
  doctors: {
    id: number;
    full_name: string;
    email: string;
    specialitie: {
      id: number;
      name: string;
    };
    avatar_url?: string;
  }[];
}

export interface CreateTicketRequest {
  doctor_id: number;
  tickets: {
    available_date: string;
    total_tickets: number;
  }[];
}

export interface BulkCreateTicketRequest {
  doctor_id: number;
  start_date: string;
  end_date: string;
  total_tickets: number;
  exclude_weekends?: boolean;
  selected_days?: number[];
}
