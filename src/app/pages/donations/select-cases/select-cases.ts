import { Component, OnInit, signal, computed } from '@angular/core';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import { Navbar } from '../../../shared/navbar/navbar';
import { CaseService } from '../../../core/services/case.service';
import { CaseEntityCardDTO } from '../../../core/models/case.model';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../../core/services/sidebar.service';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-cases',
  standalone: true,
  imports: [Sidebar, Navbar, CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './select-cases.html',
  styleUrl: './select-cases.css',
})
export class SelectCases implements OnInit {
  beneficiaries = signal<CaseEntityCardDTO[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalCount = signal(0);
  isLoading = signal(false);
  isSubmitting = signal(false);
  isFilterOpen = signal(false);

  // State collected from the previous page
  aidDescription: string = '';
  aidNotes: string = '';

  selectedCaseIds = new Set<number>();

  filterForm: FormGroup;
  categories = ['فقير', 'يتيم', 'أرملة', 'معاق', 'أخرى'];

  constructor(
    private caseService: CaseService,
    public sidebarService: SidebarService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      ssn: [''],
      phone: [''],
      category: [''],
      address: ['']
    });

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.aidDescription = nav.extras.state['description'] || '';
      this.aidNotes = nav.extras.state['notes'] || '';
    } else {
      // Fallback if accessed directly
      const state = history.state;
      if (state && state.description) {
        this.aidDescription = state.description;
        this.aidNotes = state.notes || '';
      } else {
        // If no state, go back
        this.router.navigate(['/donations']);
      }
    }
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

  get userId(): string {
    return localStorage.getItem('userId') || '';
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

  toggleCaseSelection(id: number) {
    if (this.selectedCaseIds.has(id)) {
      this.selectedCaseIds.delete(id);
    } else {
      this.selectedCaseIds.add(id);
    }
  }

  isCaseSelected(id: number): boolean {
    return this.selectedCaseIds.has(id);
  }

  toggleAllOnPage(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentItems = this.beneficiaries();
    if (isChecked) {
      currentItems.forEach(item => this.selectedCaseIds.add(item.id));
    } else {
      currentItems.forEach(item => this.selectedCaseIds.delete(item.id));
    }
  }

  get allOnPageSelected(): boolean {
    const currentItems = this.beneficiaries();
    if (currentItems.length === 0) return false;
    return currentItems.every(item => this.selectedCaseIds.has(item.id));
  }

  submitBulkAid() {
    if (this.selectedCaseIds.size === 0 || !this.aidDescription.trim()) return;

    this.isSubmitting.set(true);

    const dto = {
      caseEntityIds: Array.from(this.selectedCaseIds),
      description: this.aidDescription,
      notes: this.aidNotes,
      userId: this.userId
    };

    this.caseService.addAidBulk(dto).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/donations']);
      },
      error: (err) => {
        console.error('Error adding bulk aid:', err);
        this.isSubmitting.set(false);
        // You might want to show a toast message here
      }
    });
  }

  getFullImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/default-avatar.png';
    if (url.startsWith('http')) return url;
    return url;
  }
}
