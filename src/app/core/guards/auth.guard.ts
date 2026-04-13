import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (isAuthenticated && !userService.isTokenExpired()) {
    return true;
  }

  // Not logged in or expired → perform logout and redirect to login page
  userService.logout();
  return false;
};
