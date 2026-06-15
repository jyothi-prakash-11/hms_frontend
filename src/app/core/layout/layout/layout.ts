import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { RouterOutlet } from '@angular/router';
import { Header } from "../../../shared/components/header/header";
import { ToastComponent } from "../../../shared/components/toast/toast";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Sidebar, RouterOutlet, Header, ToastComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class Layout { }
