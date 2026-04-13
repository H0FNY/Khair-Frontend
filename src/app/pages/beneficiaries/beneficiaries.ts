import { Component, OnInit, signal } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { Navbar } from '../../shared/navbar/navbar';
import { CaseService } from '../../core/services/case.service';
import { CaseEntityCardDTO } from '../../core/models/case.model';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../core/services/sidebar.service';
import { AddBeneficiaryModal } from '../../shared/add-beneficiary-modal/add-beneficiary-modal';
import { RouterModule, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [Sidebar, Navbar, CommonModule, AddBeneficiaryModal, RouterModule, RouterLink, ReactiveFormsModule],
  templateUrl: './beneficiaries.html',
  styleUrl: './beneficiaries.css',
})
export class Beneficiaries implements OnInit {
  beneficiaries = signal<CaseEntityCardDTO[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalCount = signal(0);
  isLoading = signal(false);
  isAddModalOpen = signal(false);
  isFilterOpen = signal(false);

  filterForm: FormGroup;
  categories = ['فقير', 'يتيم', 'أرملة', 'معاق', 'أخرى'];

  constructor(
    private caseService: CaseService,
    public sidebarService: SidebarService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      ssn: [''],
      phone: [''],
      category: [''],
      address: ['']
    });
  }

  get hasActiveFilters(): boolean {
    const v = this.filterForm.value;
    return !!(v.name || v.ssn || v.phone || v.category || v.address);
  }

  toggleFilter() {
    this.isFilterOpen.update(v => !v);
  }

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(page: number = 1): void {
    this.isLoading.set(true);
    const filters = this.filterForm.value;
    
    this.caseService.getAll(page, this.pageSize(), filters).subscribe({
      next: (res) => {
        const sortedItems = res.items.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        this.beneficiaries.set(sortedItems);
        this.currentPage.set(res.pageNumber);
        this.totalPages.set(res.totalPages);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching beneficiaries:', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters() {
    this.loadBeneficiaries(1);
  }

  resetFilters() {
    this.filterForm.reset({
      name: '',
      ssn: '',
      phone: '',
      category: '',
      address: ''
    });
    this.loadBeneficiaries(1);
  }

  openAddModal() {
    this.isAddModalOpen.set(true);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
  }

  onAddSuccess() {
    this.loadBeneficiaries(1); // Refresh the first page
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.loadBeneficiaries(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.loadBeneficiaries(this.currentPage() - 1);
    }
  }

  getFullImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/default-avatar.png';
    if (url.startsWith('http')) return url;
    return url;
  }
}
