import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(public sidebarService: SidebarService, private router: Router) { }

  menuItems = [
    { icon: 'home', label: 'الرئيسية', route: '/home' },
    { icon: 'users', label: 'المستفيدين', route: '/beneficiaries' },
    { icon: 'heart', label: 'التبرعات', route: '/donations' },
    { icon: 'bar-chart', label: 'التقارير', route: '/reports' },
    { icon: 'settings', label: 'الإعدادات', route: '/settings' },
  ];

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  onItemClick() {
    if (window.innerWidth <= 768) {
      this.sidebarService.close();
    }
  }

  logout() {
    console.log('logout');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
