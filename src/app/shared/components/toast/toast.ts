import { Component, inject } from '@angular/core';
import ToastService from './toast.service';
import Toast from './toast.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css'],
})
export class ToastComponent {

  toastService = inject(ToastService);
  toasts = this.toastService.toasts;

}
