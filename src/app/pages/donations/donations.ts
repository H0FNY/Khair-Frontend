import { Component, OnInit, signal } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { Navbar } from '../../shared/navbar/navbar';
import { CaseService } from '../../core/services/case.service';
import { AidCardDTO } from '../../core/models/case.model';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../core/services/sidebar.service';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [Sidebar, Navbar, CommonModule, RouterModule, FormsModule],
  templateUrl: './donations.html',
  styleUrl: './donations.css',
})
export class Donations implements OnInit {
  donations = signal<AidCardDTO[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalCount = signal(0);
  isLoading = signal(false);

  // Filter State
  filterCaseName = '';
  filterDescription = '';
  filterDateFrom = '';
  filterDateTo = '';
  isFilterOpen = signal(false);

  // Modal State
  isAddModalOpen = signal(false);
  newAidDescription = '';
  newAidNotes = '';

  constructor(
    private caseService: CaseService,
    public sidebarService: SidebarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  get userId(): string {
    return localStorage.getItem('userId') || '';
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterCaseName || this.filterDescription || this.filterDateFrom || this.filterDateTo);
  }

  loadDonations(page: number = 1): void {
    const uId = this.userId;
    if (!uId) return;

    this.isLoading.set(true);

    const filters = {
      caseName: this.filterCaseName || undefined,
      description: this.filterDescription || undefined,
      dateFrom: this.filterDateFrom || undefined,
      dateTo: this.filterDateTo || undefined,
    };

    this.caseService.getAidsByUser(uId, page, this.pageSize(), filters).subscribe({
      next: (res) => {
        this.donations.set(res.items);
        this.currentPage.set(res.pageNumber);
        this.totalPages.set(res.totalPages);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching donations:', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadDonations(1);
  }

  resetFilters(): void {
    this.filterCaseName = '';
    this.filterDescription = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.loadDonations(1);
  }

  toggleFilter(): void {
    this.isFilterOpen.update(v => !v);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.loadDonations(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.loadDonations(this.currentPage() - 1);
    }
  }

  openAddModal() {
    this.newAidDescription = '';
    this.newAidNotes = '';
    this.isAddModalOpen.set(true);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
  }

  proceedToSelectCases() {
    if (!this.newAidDescription.trim()) return;
    this.closeAddModal();
    this.router.navigate(['/donations/select-cases'], {
      state: {
        description: this.newAidDescription,
        notes: this.newAidNotes
      }
    });
  }
}
