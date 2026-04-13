import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(private router: Router, private sidebarService: SidebarService) {}

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
