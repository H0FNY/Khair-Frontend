import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Prevents already-authenticated users from visiting the login page.
 * If the user is logged in, redirect them directly to /home.
 */
export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return true;
  }

  // Already logged in → go to home
  router.navigate(['/home']);
  return false;
};
