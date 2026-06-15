import { Component, OnInit, signal } from '@angular/core';
import { ProfileResponse } from './header.model';
import HeaderService from './header.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [DatePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  constructor(private headerService: HeaderService) { }
  profile = signal<ProfileResponse | null>(null);
  showProfile = signal<boolean>(false);
  ngOnInit(): void {
    this.loadProfile();
  }
  loadProfile() {
    this.headerService.getProfile()
      .subscribe(
        {
          next: (res) => {
            console.log('PROFILE...', res);
            this.profile.set(res.data);
          }
        }
      );
  }
  toggleProfile() {
    this.showProfile.update(value => !value);
  }
}
