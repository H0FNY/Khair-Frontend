import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UiService } from '../../core/services/ui.service';
import { UserProfileDTO, UserUpdateDTO } from '../../core/models/user.model';
import { Navbar } from '../../shared/navbar/navbar';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { SidebarService } from '../../core/services/sidebar.service';
import { Router } from '@angular/router';

type SettingsTab = 'profile' | 'security' | 'account';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Navbar, Sidebar],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  activeTab = signal<SettingsTab>('profile');
  user = signal<UserProfileDTO | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isPhoneChecking = signal(false);
  phoneError = signal('');

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private uiService: UiService,
    public sidebarService: SidebarService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadProfile();
  }

  initForms() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
      address: ['', Validators.required],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  loadProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getProfile(userId).subscribe({
      next: (data) => {
        this.user.set(data);
        this.profileForm.patchValue({
          name: data.name,
          phone: data.phone,
          address: data.address
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.uiService.showError(err, 'تعذر تحميل بيانات الملف الشخصي');
        this.isLoading.set(false);
      }
    });
  }

  switchTab(tab: SettingsTab) {
    this.activeTab.set(tab);
  }

  onProfileSubmit() {
    if (this.profileForm.invalid || !this.user() || this.phoneError()) return;
    this.isSubmitting.set(true);

    const dto: UserUpdateDTO = {
      id: this.user()!.id,
      ...this.profileForm.value
    };

    this.userService.updateProfile(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.uiService.showToast('تم تحديث الملف الشخصي بنجاح', 'success');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.uiService.showError(err, 'حدث خطأ أثناء تحديث البيانات');
      }
    });
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid || !this.user()) return;
    this.isSubmitting.set(true);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword(this.user()!.id, { currentPassword, newPassword }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.uiService.showToast('تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مجدداً.', 'success');
        this.passwordForm.reset();
        setTimeout(() => this.logout(), 2000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.uiService.showError(err, 'كلمة المرور الحالية غير صحيحة');
      }
    });
  }

  onPhoneBlur() {
    const val = this.profileForm.get('phone')?.value;
    const currentUserPhone = this.user()?.phone;
    
    if (val && val !== currentUserPhone && this.profileForm.get('phone')?.valid) {
      this.isPhoneChecking.set(true);
      this.phoneError.set('');
      
      this.userService.checkPhone(val).subscribe({
        next: () => {
          this.isPhoneChecking.set(false);
          this.phoneError.set('');
        },
        error: (err) => {
          this.isPhoneChecking.set(false);
          // If status is 404, it means it exists (based on backend NotFound return)
          if (err.status === 404) {
            this.phoneError.set(err.error || 'رقم الهاتف مسجل من قبل');
            this.profileForm.get('phone')?.setErrors({ duplicated: true });
          } else {
            console.error('Phone check error:', err);
            this.phoneError.set('');
          }
        }
      });
    } else {
      this.phoneError.set('');
    }
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.user()) {
      this.isSubmitting.set(true);
      this.userService.uploadPhoto(this.user()!.id, file).subscribe({
        next: (res) => {
          this.user.update(u => u ? { ...u, profileImageUrl: res.profileImageUrl } : null);
          this.isSubmitting.set(false);
          this.uiService.showToast('تم تحديث الصورة الشخصية', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'تعذر رفع الصورة');
        }
      });
    }
  }

  async onDeleteAccount() {
    const confirmed = await this.uiService.confirm({
      title: 'حذف الحساب',
      message: 'هل أنت متأكد من حذف حسابك نهائياً؟ ستفقد جميع البيانات ولا يمكن التراجع عن هذا الإجراء.',
      confirmText: 'حذف نهائي',
      cancelText: 'تراجع',
      isDestructive: true
    });

    if (confirmed && this.user()) {
      this.isSubmitting.set(true);
      this.userService.deleteAccount(this.user()!.id).subscribe({
        next: () => {
          this.uiService.showToast('تم حذف الحساب بنجاح', 'success');
          this.logout();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.uiService.showError(err, 'حدث خطأ أثناء حذف الحساب');
        }
      });
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
