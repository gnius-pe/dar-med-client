import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {DoctorTicketService} from "../ticket.service";
import {CreateTicketRequest} from "../ticket.model";

@Component({
  selector: 'app-create-doctor-tickets-modal',
  templateUrl: './create-doctor-tickets-modal.component.html',
  styleUrls: ['./create-doctor-tickets-modal.component.scss']
})
export class CreateDoctorTicketsModalComponent implements OnChanges {

  @Input() doctorId: null | number = null;
  @Input() isVisible = false;

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() successModalEvent = new EventEmitter<void>();
  @Output() errorModalEvent = new EventEmitter<string>();

  ticketForm: FormGroup;
  isLoading = false;
  tickets: { available_date: string; total_tickets: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private doctorTicketService: DoctorTicketService
  ) {
    this.ticketForm = this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('isVisible') && this.isVisible) {
      this.resetForm();
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      available_date: ['', Validators.required],
      total_tickets: [1, [Validators.required, Validators.min(1), Validators.max(200)]]
    });
  }

  addTicket(): void {
    if (this.ticketForm.invalid) {
      this.errorModalEvent.emit('Complete todos los campos correctamente');
      return;
    }

    const formValue = this.ticketForm.value;

    const existingTicket = this.tickets.find(t => t.available_date === formValue.available_date);
    if (existingTicket) {
      this.errorModalEvent.emit('Ya existe un ticket para esta fecha');
      return;
    }

    this.tickets.push({
      available_date: formValue.available_date,
      total_tickets: formValue.total_tickets
    });

    this.ticketForm.patchValue({
      available_date: '',
      total_tickets: 1
    });
  }

  removeTicket(index: number): void {
    this.tickets.splice(index, 1);
  }

  saveTickets(): void {
    if (!this.doctorId) {
      this.errorModalEvent.emit('Doctor ID es requerido');
      return;
    }

    if (this.tickets.length === 0) {
      this.errorModalEvent.emit('Debe agregar al menos un ticket');
      return;
    }

    this.isLoading = true;

    const requestData: CreateTicketRequest = {
      doctor_id: this.doctorId,
      tickets: this.tickets
    };

    this.doctorTicketService.createTickets(requestData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.message === 200) {
          this.successModalEvent.emit();
          this.closeModal();
        } else {
          this.errorModalEvent.emit(response.message_text || 'Error al crear tickets');
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorModalEvent.emit('Error en el servidor');
      }
    });
  }

  closeModal(): void {
    this.resetForm();
    this.closeModalEvent.emit();
  }

  private resetForm(): void {
    this.ticketForm.reset({
      available_date: '',
      total_tickets: 1
    });
    this.tickets = [];
    this.isLoading = false;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
