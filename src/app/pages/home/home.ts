import { Component, OnInit, signal } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { Navbar } from '../../shared/navbar/navbar';
import { CaseService } from '../../core/services/case.service';
import { CaseEntityCardDTO } from '../../core/models/case.model';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../core/services/sidebar.service';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [Sidebar, Navbar, CommonModule, RouterModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  recentCases: CaseEntityCardDTO[] = [];
  isLoading = signal(true);

  stats = [
    { label: 'إجمالي المستفيدين', value: '...', icon: 'users', color: '#10b981', bg: '#ecfdf5', change: '' },
    { label: 'إجمالي التبرعات', value: '...', icon: 'heart', color: '#6366f1', bg: '#eef2ff', change: '' },
    { label: 'المشاريع النشطة', value: '23', icon: 'folder', color: '#f59e0b', bg: '#fffbeb', change: '+3' },
    { label: 'الفعاليات القادمة', value: '7', icon: 'calendar', color: '#ec4899', bg: '#fdf2f8', change: 'قريباً' },
  ];

  constructor(
    private caseService: CaseService,
    public sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    this.isLoading.set(true);
    // Try load total beneficiaries from cache
    const cachedTotalCases = localStorage.getItem('totalCasesCount');
    if (cachedTotalCases) {
      this.stats[0].value = new Intl.NumberFormat('ar-EG').format(parseInt(cachedTotalCases, 10));
    }

    this.caseService.getAll(1, 10).subscribe({
      next: (res) => {
        this.recentCases = res.items.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        // Update Total Beneficiaries stat and cache it
        localStorage.setItem('totalCasesCount', res.totalCount.toString());
        this.stats[0].value = new Intl.NumberFormat('ar-EG').format(res.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching cases:', err);
        this.isLoading.set(false);
      }
    });

    const userId = localStorage.getItem('userId');
    if (userId) {
      // Load aids count from cache instantly
      const cachedAids = localStorage.getItem(`aidsCount_${userId}`);
      if (cachedAids) {
        this.stats[1].value = new Intl.NumberFormat('ar-EG').format(parseInt(cachedAids, 10));
      }

      this.caseService.getCountAidsByUser(userId).subscribe({
        next: (count) => {
          localStorage.setItem(`aidsCount_${userId}`, count.toString());
          this.stats[1].value = new Intl.NumberFormat('ar-EG').format(count);
        },
        error: (err) => {
          console.error('Error fetching aids count:', err);
        }
      });
    }
  }

  getFullImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/default-avatar.png';
    if (url.startsWith('http')) return url;
    return url;
  }
}
