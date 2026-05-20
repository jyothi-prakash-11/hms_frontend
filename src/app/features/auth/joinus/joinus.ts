import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { RolesResponse } from '../auth.model';

@Component({
  selector: 'app-joinus',
  imports: [],
  templateUrl: './joinus.html',
  styleUrl: './joinus.css',
})
export class Joinus implements OnInit {
  constructor(private authService: AuthService) { }
  roles: { name : string}[] = [];
  ngOnInit(): void {
    this.authService.getRoles().subscribe(
      (res) => {
        this.roles = res.data;
        console.log(res);
        console.log(this.roles);
      }
    )
  }
}
