import { Component, OnInit, signal } from '@angular/core';
import { NavigationService } from '../../navigation/navigation.service';
import { NavItems } from '../../navigation/navigation.model';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../features/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnInit {
  navItems = signal<NavItems[]>([]);
  baseRoute = '';
  constructor(private navService: NavigationService) { }
  ngOnInit(): void {
    this.baseRoute = this.navService.getCurrentModule();
    this.navService.getNavgation().subscribe(
      {
        next: (res) => {
          console.log(res);
          this.navItems.set(res.data);
        }
      }
    );
  }
}
