import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { Navbar } from '../../shared/navbar/navbar';
import { CaseService } from '../../core/services/case.service';
import { CaseEntityProfileDTO } from '../../core/models/case.model';
import { SidebarService } from '../../core/services/sidebar.service';
import { UiService } from '../../core/services/ui.service';

type ModalType = 'profile' | 'family' | 'house' | 'income' | 'spend' | 'phone' | 'aid' | 'image' | null;

@Component({
  selector: 'app-case-profile',
  standalone: true,
  imports: [CommonModule, Sidebar, Navbar, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './case-profile.html',
  styleUrl: './case-profile.css'
})
export class CaseProfile implements OnInit {
  caseProfile = signal<CaseEntityProfileDTO | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  selectedImage = signal<string | null>(null);
  error = signal<string | null>(null);
  
  // Modal State
  activeModal = signal<ModalType>(null);
  modalForm!: FormGroup;

  isFieldChecking = signal(false);
  fieldError = signal('');
  
  // Edit State
  isEditing = signal(false);
  editingId = signal<number | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    public sidebarService: SidebarService,
    private uiService: UiService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProfile(Number(id));
    } else {
      this.error.set('معرف الحالة غير موجود');
      this.isLoading.set(false);
    }
  }

  loadProfile(id: number): void {
    this.isLoading.set(true);
    this.caseService.getProfileById(id).subscribe({
      next: (profile) => {
        this.caseProfile.set(profile);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.error.set('تعذر جلب بيانات الحالة. يرجى المحاولة لاحقاً.');
        this.isLoading.set(false);
      }
    });
  }

  // Modal Methods
  openModal(type: ModalType, item?: any) {
    this.activeModal.set(type);
    this.isFieldChecking.set(false);
    this.fieldError.set('');
    
    if (item) {
      this.isEditing.set(true);
      this.editingId.set(item.id);
    } else {
      this.isEditing.set(false);
      this.editingId.set(null);
    }
    
    this.initForm(type, item);
  }

  closeModal() {
    this.activeModal.set(null);
  }

  initForm(type: ModalType, item?: any) {
    switch (type) {
      case 'profile':
        this.modalForm = this.fb.group({
          name: [item?.name || '', Validators.required],
          ssnid: [item?.ssnid || '', [Validators.required, Validators.pattern(/^\d{14}$/)]],
          address: [item?.address || '', Validators.required],
          education: [item?.education || ''],
          work: [item?.work || ''],
          status: [item?.status || 'أعزب', Validators.required],
          category: [item?.category || 'فقير', Validators.required],
          need: [item?.need || ''],
          notes: [item?.notes || '']
        });
        break;
      case 'family':
        this.modalForm = this.fb.group({
          name: [item?.name || '', Validators.required],
          ssnid: [item?.ssnid || '', [Validators.required, Validators.pattern(/^\d{14}$/)]],
          relation: [item?.relation || '', Validators.required],
          education: [item?.education || '', Validators.required],
          work: [item?.work || '', Validators.required],
          status: [item?.status || 'أعزب', Validators.required],
          notes: [item?.notes || '']
        });
        break;
      case 'house':
        const house = item || this.caseProfile()?.houses;
        this.modalForm = this.fb.group({
          isRented: [house?.isRented || false],
          rentAmount: [house?.rentAmount || 0],
          notes: [house?.notes || ''],
          caseEntityId: [this.caseProfile()?.id]
        });
        break;
      case 'income':
      case 'spend':
        this.modalForm = this.fb.group({
          value: [item?.value || 0, [Validators.required, Validators.min(1)]],
          notes: [item?.notes || ''],
          caseEntityId: [this.caseProfile()?.id]
        });
        break;
      case 'phone':
        this.modalForm = this.fb.group({
          phoneNumber: [item?.phoneNumber || '', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
          caseEntityId: [this.caseProfile()?.id]
        });
        break;
      case 'aid':
        this.modalForm = this.fb.group({
          description: [item?.description || '', Validators.required],
          notes: [item?.notes || ''],
          caseEntityId: [this.caseProfile()?.id],
          userId: [localStorage.getItem('userId')]
        });
        break;
    }
  }

  onFieldBlur(type: 'ssn' | 'phone') {
    const controlName = type === 'ssn' ? 'ssnid' : 'phoneNumber';
    const val = this.modalForm.get(controlName)?.value;
    
    if (val && this.modalForm.get(controlName)?.valid) {
      this.isFieldChecking.set(true);
      this.fieldError.set('');
      
      const obs = type === 'ssn' ? this.caseService.checkSSN(val) : this.caseService.checkPhone(val);
      
      obs.subscribe({
        next: (res) => {
          this.isFieldChecking.set(false);
          if (res.exists) {
            this.fieldError.set(res.message || (type === 'ssn' ? 'هذا الرقم القومي مسجل مسبقاً' : 'رقم الهاتف هذا مسجل مسبقاً'));
            this.modalForm.get(controlName)?.setErrors({ duplicated: true });
          } else {
            this.fieldError.set('');
          }
        },
        error: () => {
          this.isFieldChecking.set(false);
        }
      });
    }
  }

  handleFileUpload(event: any) {
    const files = event.target.files;
    if (files.length > 0 && this.caseProfile()) {
      this.isSubmitting.set(true);
      this.caseService.uploadImage(this.caseProfile()!.id, Array.from(files)).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadProfile(this.caseProfile()!.id);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'تعذر رفع الصور. يرجى المحاولة لاحقاً.');
        }
      });
    }
  }

  async submitModal() {
    if (this.modalForm.invalid) return;

    const id = this.caseProfile()!.id;
    const modalType = this.activeModal();
    this.isSubmitting.set(true);

    try {
      // 1. Perform Pre-checks (Only for new additions or phone updates/ssn updates)
      if (modalType === 'profile' || modalType === 'family') {
        const ssn = this.modalForm.get('ssnid')?.value;
        const currentSsn = modalType === 'profile' ? this.caseProfile()?.ssnid : (this.isEditing() ? this.caseProfile()?.families?.find((f: any) => f.id === this.editingId())?.ssnid : null);
        
        if (ssn !== currentSsn) {
          const res = await firstValueFrom(this.caseService.checkSSN(ssn));
          if (res.exists) {
            this.isSubmitting.set(false);
            this.fieldError.set(res.message || 'هذا الرقم القومي مسجل مسبقاً');
            return;
          }
        }
      } else if (modalType === 'phone') {
        const phone = this.modalForm.get('phoneNumber')?.value;
        // Basic check, backend will do more thorough uniqueness validation
        const res = await firstValueFrom(this.caseService.checkPhone(phone));
        if (res.exists && (!this.isEditing() || phone !== (this.caseProfile()?.phones?.find(p => p.id === this.editingId())?.phoneNumber))) {
          this.isSubmitting.set(false);
          this.fieldError.set(res.message || 'رقم الهاتف هذا مسجل مسبقاً');
          return;
        }
      }

      // 2. Perform actual submission
      let obs;
      if (this.isEditing()) {
        const itemId = this.editingId()!;
        switch (modalType) {
          case 'phone': obs = this.caseService.updatePhone(itemId, this.modalForm.value); break;
          case 'house': obs = this.caseService.updateHouse(itemId, this.modalForm.value); break;
          case 'family': obs = this.caseService.updateFamily(itemId, this.modalForm.value); break;
          case 'income': obs = this.caseService.updateIncome(itemId, this.modalForm.value); break;
          case 'spend': obs = this.caseService.updateSpend(itemId, this.modalForm.value); break;
          case 'aid': obs = this.caseService.updateAid(itemId, this.modalForm.value); break;
          case 'profile': obs = this.caseService.updateCaseEntity(itemId, this.modalForm.value); break;
        }
      } else {
        switch (modalType) {
          case 'family': obs = this.caseService.addMember(id, this.modalForm.value); break;
          case 'house': obs = this.caseService.addHouse(id, this.modalForm.value); break;
          case 'income': obs = this.caseService.addIncome(id, this.modalForm.value); break;
          case 'spend': obs = this.caseService.addSpend(id, this.modalForm.value); break;
          case 'phone': obs = this.caseService.addPhone(id, this.modalForm.value); break;
          case 'aid': obs = this.caseService.addAid(id, this.modalForm.value); break;
        }
      }

      if (obs) {
        await firstValueFrom(obs);
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadProfile(id);
        this.uiService.showToast('تم الحفظ بنجاح', 'success');
      }
    } catch (err: any) {
      this.isSubmitting.set(false);
      this.uiService.showError(err, 'حدث خطأ أثناء الحفظ.');
    }
  }

  async deletePhone(phoneId: number) {
    const confirmed = await this.uiService.confirm({
      title: 'حذف رقم الهاتف',
      message: 'هل أنت متأكد من حذف رقم الهاتف هذا؟',
      confirmText: 'حذف',
      cancelText: 'تراجع',
      isDestructive: true
    });

    if (confirmed) {
      this.isSubmitting.set(true);
      this.caseService.deletePhone(phoneId).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadProfile(this.caseProfile()!.id);
          this.uiService.showToast('تم الحذف بنجاح', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'تعذر حذف رقم الهاتف.');
        }
      });
    }
  }

  async deleteFamily(id: number) {
    const confirmed = await this.uiService.confirm({
      title: 'حذف فرد أسرة',
      message: 'هل أنت متأكد من حذف هذا الفرد من الأسرة؟',
      confirmText: 'حذف',
      cancelText: 'تراجع',
      isDestructive: true
    });

    if (confirmed) {
      this.isSubmitting.set(true);
      this.caseService.deleteFamily(id).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadProfile(this.caseProfile()!.id);
          this.uiService.showToast('تم الحذف بنجاح', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'تعذر حذف فرد الأسرة.');
        }
      });
    }
  }

  async deleteIncome(id: number) {
    const confirmed = await this.uiService.confirm({
      title: 'حذف مصدر دخل',
      message: 'هل أنت متأكد من حذف مصدر الدخل هذا؟',
      confirmText: 'حذف',
      cancelText: 'تراجع',
      isDestructive: true
    });

    if (confirmed) {
      this.isSubmitting.set(true);
      this.caseService.deleteIncome(id).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadProfile(this.caseProfile()!.id);
          this.uiService.showToast('تم الحذف بنجاح', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'تعذر حذف مصدر الدخل.');
        }
      });
    }
  }

  async deleteSpend(id: number) {
    const confirmed = await this.uiService.confirm({
      title: 'حذف مصروفات',
      message: 'هل أنت متأكد من حذف هذه المصروفات؟',
      confirmText: 'حذف',
      cancelText: 'تراجع',
      isDestructive: true
    });

    if (confirmed) {
      this.isSubmitting.set(true);
      this.caseService.deleteSpend(id).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadProfile(this.caseProfile()!.id);
          this.uiService.showToast('تم الحذف بنجاح', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'تعذر حذف المصروفات.');
        }
      });
    }
  }

  async deleteAid(id: number) {
    const confirmed = await this.uiService.confirm({
      title: 'حذف سجل مساعدة',
      message: 'هل أنت متأكد من حذف سجل المساعدة هذا؟',
      confirmText: 'حذف',
      cancelText: 'تراجع',
      isDestructive: true
    });

    if (confirmed) {
      this.isSubmitting.set(true);
      this.caseService.deleteAid(id).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadProfile(this.caseProfile()!.id);
          this.uiService.showToast('تم الحذف بنجاح', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'تعذر حذف سجل المساعدة.');
        }
      });
    }
  }

  async deleteImage(id: number) {
    const confirmed = await this.uiService.confirm({
      title: 'حذف صورة',
      message: 'هل أنت متأكد من حذف هذه الصورة؟',
      confirmText: 'حذف',
      cancelText: 'تراجع',
      isDestructive: true
    });

    if (confirmed) {
      this.isSubmitting.set(true);
      this.caseService.deleteImage(id).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadProfile(this.caseProfile()!.id);
          this.uiService.showToast('تم حذف الصورة بنجاح', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'تعذر حذف الصورة.');
        }
      });
    }
  }

  viewImage(url: string) {
    this.selectedImage.set(url);
  }

  closeImageViewer() {
    this.selectedImage.set(null);
  }

  async deleteHouse() {
    const houseId = this.caseProfile()?.houses?.id;
    if (!houseId) return;

    const confirmed = await this.uiService.confirm({
      title: 'حذف بيانات السكن',
      message: 'هل أنت متأكد من حذف بيانات السكن لهذه الحالة؟',
      confirmText: 'حذف',
      cancelText: 'تراجع',
      isDestructive: true
    });

    if (confirmed) {
      this.isSubmitting.set(true);
      this.caseService.deleteHouse(houseId).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadProfile(this.caseProfile()!.id);
          this.uiService.showToast('تم الحذف بنجاح', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'تعذر حذف بيانات السكن.');
        }
      });
    }
  }

  // Calculations
  getTotalIncome(): number {
    return this.caseProfile()?.incomes?.reduce((acc, curr) => acc + curr.value, 0) || 0;
  }

  getTotalSpends(): number {
    return this.caseProfile()?.spends?.reduce((acc, curr) => acc + curr.value, 0) || 0;
  }

  getFinancialBalance(): number {
    return this.getTotalIncome() - this.getTotalSpends();
  }

  getFullImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/default-avatar.png';
    if (url.startsWith('http')) return url;
    return url;
  }

  async deleteCase(): Promise<void> {
    const confirmed = await this.uiService.confirm({
      title: 'حذف المستفيد',
      message: 'هل أنت متأكد من حذف هذا المستفيد نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmText: 'حذف الآن',
      cancelText: 'تراجع',
      isDestructive: true
    });

    if (confirmed) {
      const id = this.caseProfile()?.id;
      if (!id) return;

      this.isSubmitting.set(true);
      this.caseService.deleteCase(id).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.uiService.showToast('تم حذف المستفيد بنجاح', 'success');
          this.router.navigate(['/beneficiaries']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'حدث خطأ أثناء حذف الحالة.');
        }
      });
    }
  }
}
