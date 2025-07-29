import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {DoctorTicketService} from "../ticket.service";
import {DoctorTicket} from "../ticket.model";

@Component({
  selector: 'app-manage-doctor-tickets-modal',
  templateUrl: './manage-doctor-tickets-modal.component.html',
  styleUrls: ['./manage-doctor-tickets-modal.component.scss']
})
export class ManageDoctorTicketsModalComponent implements OnChanges {
  @Input() doctorId: null | number = null;
  @Input() isVisible = false;
  @Input() doctorName = '';

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() successModalEvent = new EventEmitter<void>();
  @Output() errorModalEvent = new EventEmitter<string>();

  isLoading = false;
  isUpdating = false;
  tickets: DoctorTicket[] = [];
  editingTicket: number | null = null;
  tempValue = 0;

  constructor(
    private doctorTicketService: DoctorTicketService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('isVisible') && this.isVisible && this.doctorId) {
      this.loadDoctorTickets();
    }
  }

  loadDoctorTickets(): void {
    if (!this.doctorId) return;

    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    this.isLoading = true;
    this.doctorTicketService.getDoctorTickets(this.doctorId, startDate, endDate).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.tickets = response.tickets || [];
      },
      error: () => {
        this.isLoading = false;
        this.errorModalEvent.emit('Error al cargar los cupos del doctor');
      }
    });
  }

  startEdit(ticket: DoctorTicket): void {
    this.editingTicket = ticket.id;
    this.tempValue = ticket.total_tickets;
  }

  cancelEdit(): void {
    this.editingTicket = null;
    this.tempValue = 0;
  }

  saveEdit(ticket: DoctorTicket): void {
    if (this.tempValue < ticket.used_tickets) {
      this.errorModalEvent.emit(`No puede reducir a ${this.tempValue} cupos. Ya se han usado ${ticket.used_tickets} cupos.`);
      return;
    }

    if (this.tempValue <= 0) {
      this.errorModalEvent.emit('La cantidad debe ser mayor a 0');
      return;
    }

    this.isUpdating = true;

    this.doctorTicketService.updateTicket(ticket.id, {
      total_tickets: this.tempValue,
      is_active: ticket.is_active
    }).subscribe({
      next: (response) => {
        this.isUpdating = false;
        if (response.message === 200) {
          // Actualizar el ticket en la lista local
          const index = this.tickets.findIndex(t => t.id === ticket.id);
          if (index !== -1) {
            this.tickets[index].total_tickets = this.tempValue;
            this.tickets[index].available_tickets = this.tempValue - ticket.used_tickets;
          }
          this.cancelEdit();
          this.successModalEvent.emit();
        } else {
          this.errorModalEvent.emit(response.message_text || 'Error al actualizar el cupo');
        }
      },
      error: () => {
        this.isUpdating = false;
        this.errorModalEvent.emit('Error en el servidor al actualizar');
      }
    });
  }

  toggleActiveStatus(ticket: DoctorTicket): void {
    this.isUpdating = true;

    this.doctorTicketService.updateTicket(ticket.id, {
      total_tickets: ticket.total_tickets,
      is_active: !ticket.is_active
    }).subscribe({
      next: (response) => {
        this.isUpdating = false;
        if (response.message === 200) {
          const index = this.tickets.findIndex(t => t.id === ticket.id);
          if (index !== -1) {
            this.tickets[index].is_active = !ticket.is_active;
          }
          this.successModalEvent.emit();
        } else {
          this.errorModalEvent.emit(response.message_text || 'Error al cambiar estado');
        }
      },
      error: () => {
        this.isUpdating = false;
        this.errorModalEvent.emit('Error en el servidor');
      }
    });
  }

  deleteTicket(ticket: DoctorTicket): void {
    if (ticket.used_tickets > 0) {
      this.errorModalEvent.emit('No se puede eliminar un cupo que ya tiene citas asignadas');
      return;
    }

    if (!confirm(`¿Está seguro de eliminar el cupo del ${this.formatDate(ticket.available_date)}?`)) {
      return;
    }

    this.isUpdating = true;

    this.doctorTicketService.deleteTicket(ticket.id).subscribe({
      next: (response) => {
        this.isUpdating = false;
        if (response.message === 200) {
          this.tickets = this.tickets.filter(t => t.id !== ticket.id);
          this.successModalEvent.emit();
        } else {
          this.errorModalEvent.emit(response.message_text || 'Error al eliminar el cupo');
        }
      },
      error: () => {
        this.isUpdating = false;
        this.errorModalEvent.emit('Error en el servidor al eliminar');
      }
    });
  }

  closeModal(): void {
    this.editingTicket = null;
    this.tempValue = 0;
    this.tickets = [];
    this.closeModalEvent.emit();
  }

  formatDate(dateString: string): string {

    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusBadgeClass(ticket: DoctorTicket): string {
    if (!ticket.is_active) return 'bg-secondary';
    if (ticket.available_tickets === 0) return 'bg-danger';
    if (ticket.available_tickets <= 5) return 'bg-warning';
    return 'bg-success';
  }

  getStatusText(ticket: DoctorTicket): string {
    if (!ticket.is_active) return 'Inactivo';
    if (ticket.available_tickets === 0) return 'Agotado';
    if (ticket.available_tickets <= 5) return 'Pocos cupos';
    return 'Disponible';
  }
}
