import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/auth.service';
import { ToastComponent } from "./shared/components/toast/toast";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  constructor(private authService: AuthService) { }
  ngOnInit(): void {
    console.log('on init is executing');
    this.authService.autoAuthUser();
  }
}
