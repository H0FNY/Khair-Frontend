import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfileDTO, UserUpdateDTO, PasswordChangeDTO } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7000/api/User';

  constructor(private http: HttpClient) { }

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
