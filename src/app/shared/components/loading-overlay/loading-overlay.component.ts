import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  standalone: true,
  imports: [
    NgIf
  ],
  styleUrls: ['./loading-overlay.component.scss']
})
export class LoadingOverlayComponent {
  @Input() isBlock = false;
}
