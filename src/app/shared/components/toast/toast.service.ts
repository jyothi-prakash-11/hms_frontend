import { Injectable, signal, } from "@angular/core";
import Toast from "./toast.model";


@Injectable({
    providedIn: 'root'
})
export default class ToastService {
    private counter = 0;
    toasts = signal<Toast[]>([]);

    show(message: string, type: 'success' | 'error' | 'info' = 'info') {
        const toast: Toast = {
            id: ++this.counter,
            message,
            type
        }

        this.toasts.update(cur => [...cur, toast]);
        console.log('toast length : ', this.toasts().length);


        // This handles the automatic removal after 5 seconds
        setTimeout(() => {
            this.remove(toast.id);
        }, 5000);
    }
    success(message: string): void {
        this.show(message, 'success');
    }
    error(message: string): void {
        console.log('printing error ...')
        this.show(message, 'error');
    }
    info(message: string): void {
        this.show(message, 'info');
    }
    remove(id: number): void {
        this.toasts.update(current =>
            current.filter(t => t.id !== id)
        );
    }
}
