import { Component, OnInit, signal } from '@angular/core';
import DashboardService from './dashboard.service';
import { DashboardResponse } from './dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  constructor(private dashbpardService: DashboardService) { }
  //data holders
  dashboard = signal<DashboardResponse | null>(null);
  ngOnInit(): void {
    this.loadDashboardStats();
  }
  loadDashboardStats() {
    console.log('loading dashboard stats');
    this.dashbpardService.getDashboardStats()
      .subscribe(
        {
          next: (res) => {
            console.log("dashboard stats : ", res);
            this.dashboard.set(res.data);
          }
        }
      );
  }
}
