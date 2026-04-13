import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', canActivate: [noAuthGuard], loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', canActivate: [noAuthGuard], loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'home', canActivate: [authGuard], loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'beneficiaries', canActivate: [authGuard], loadComponent: () => import('./pages/beneficiaries/beneficiaries').then(m => m.Beneficiaries) },
  { path: 'beneficiaries/:id', canActivate: [authGuard], loadComponent: () => import('./pages/case-profile/case-profile').then(m => m.CaseProfile) },
  { path: 'donations', canActivate: [authGuard], loadComponent: () => import('./pages/donations/donations').then(m => m.Donations) },
  { path: 'donations/select-cases', canActivate: [authGuard], loadComponent: () => import('./pages/donations/select-cases/select-cases').then(m => m.SelectCases) },
  { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },
];
