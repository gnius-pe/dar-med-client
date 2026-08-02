import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {NgClass, NgIf} from "@angular/common";

export type NotificationType = 'success' | 'error' | 'warning';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnChanges,OnDestroy{

  @Input() message = '';
  @Input() type: NotificationType = 'success';
  @Input() show = false;
  @Input() duration = 3000;

  @Output() close = new EventEmitter<void>();

  private timeoutId: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && this.show) {
      this.startAutoClose();
    }
  }

  ngOnDestroy() {
    this.clearTimeout();
  }

  private startAutoClose() {
    this.clearTimeout();
    if (this.duration > 0) {
      this.timeoutId = setTimeout(() => {
        this.closeNotification();
      }, this.duration);
    }
  }

  closeNotification() {
    this.clearTimeout();
    this.close.emit();
  }

  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
