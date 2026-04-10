import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private http: HttpClient, private router: Router) { }

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage.set('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const apiUrl = `https://khair.runasp.net/api/User/Login?Username=${encodeURIComponent(this.username)}&Password=${encodeURIComponent(this.password)}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (userId) => {
        this.isLoading.set(false);
        // Store user ID or simple session flag
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('isAuthenticated', 'true');
        
        // Navigate to home/dashboard
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 404 || err.status === 401 || err.status === 400) {
          this.errorMessage.set('اسم المستخدم أو كلمة المرور غير صحيحة');
        } else if (err.status === 0) {
          this.errorMessage.set('تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً');
        } else {
          this.errorMessage.set('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
        }
      },
    });
  }
}
