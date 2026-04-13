import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage.set('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // Store user data and token
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('token', response.token);
        localStorage.setItem('tokenExpires', response.expires);
        localStorage.setItem('isAuthenticated', 'true');

        // Navigate to home
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error:', err);
        if (err.status === 404 || err.status === 401 || err.status === 400) {
          const errorMsg = typeof err.error === 'string' ? err.error : 'اسم المستخدم أو كلمة المرور غير صحيحة';
          this.errorMessage.set(errorMsg);
        } else if (err.status === 0) {
          this.errorMessage.set('تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً');
        } else {
          this.errorMessage.set('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
        }
      },
    });
  }
}
