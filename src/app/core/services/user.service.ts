import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfileDTO, UserUpdateDTO, PasswordChangeDTO, UserRegisterDTO, AuthResponseDTO } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://khair.runasp.net/api/User';

  constructor(private http: HttpClient, private router: Router) { }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isTokenExpired(): boolean {
    const expires = localStorage.getItem('tokenExpires');
    if (!expires) return true;

    const expirationDate = new Date(expires);
    return expirationDate <= new Date();
  }

  login(username: string, password: string): Observable<AuthResponseDTO> {
    const formData = new FormData();
    formData.append('Username', username);
    formData.append('Password', password);
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/Login`, formData);
  }

  register(dto: UserRegisterDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}/Register`, dto, { responseType: 'text' });
  }

  getProfile(id: string): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(`${this.apiUrl}/profile/${id}`);
  }

  updateProfile(dto: UserUpdateDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/update`, dto);
  }

  uploadPhoto(id: string, photo: File): Observable<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append('photo', photo);
    return this.http.post<{ profileImageUrl: string }>(`${this.apiUrl}/UploadPhoto/${id}`, formData);
  }

  changePassword(id: string, dto: PasswordChangeDTO): Observable<void> {
    // Note: The backend signature might be (id, current, new) as query params or body.
    // Based on the provided code: ChangePassword(string id, string currentPassword, string newPassword)
    // It's likely query params or body. Let's assume query params for string params if not [FromBody].
    return this.http.put<void>(`${this.apiUrl}/ChangePassword/${id}?currentPassword=${dto.currentPassword}&newPassword=${dto.newPassword}`, {});
  }

  checkUsername(username: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/CheckUsername?username=${username}`);
  }

  checkPhone(phone: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/CheckPhone?phone=${phone}`, { responseType: 'text' });
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
