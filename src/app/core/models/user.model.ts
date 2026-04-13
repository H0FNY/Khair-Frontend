export interface UserRegisterDTO {
  username: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  expires: string;
  userId: string;
}

export interface UserProfileDTO {
  id: string;
  name: string;
  phone: string;
  address: string;
  username: string;
  profileImageUrl?: string;
  role?: string;
}

export interface UserUpdateDTO {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface PasswordChangeDTO {
  currentPassword: string;
  newPassword: string;
}

