import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('sf_jwt');
  if (token) {
    return true;
  }
  const router = inject(Router);
  router.navigate(['/auth/login']);
  return false;
};
