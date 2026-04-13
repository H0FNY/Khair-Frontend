import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { UserRegisterDTO } from '../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerData: UserRegisterDTO = {
    username: '',
    name: '',
    phone: '',
    address: '',
    email: '',
    password: '',
  };
  confirmPassword = '';
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  onRegister() {
    if (!this.registerData.username || !this.registerData.password || !this.registerData.name || !this.registerData.phone) {
      this.errorMessage.set('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage.set('كلمات المرور غير متطابقة');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول');
        // Redirect to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Registration error:', err);
        if (err.status === 400) {
          // Backend returns string or array of errors
          if (Array.isArray(err.error)) {
             this.errorMessage.set(err.error.join(', '));
          } else {
             this.errorMessage.set(err.error || 'فشل إنشاء الحساب. قد يكون اسم المستخدم أو الهاتف موجوداً بالفعل');
          }
        } else {
          this.errorMessage.set('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
        }
      },
    });
  }
}
