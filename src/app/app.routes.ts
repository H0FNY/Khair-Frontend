import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'beneficiaries', loadComponent: () => import('./pages/beneficiaries/beneficiaries').then(m => m.Beneficiaries) },
  { path: 'beneficiaries/:id', loadComponent: () => import('./pages/case-profile/case-profile').then(m => m.CaseProfile) },
  { path: 'donations', loadComponent: () => import('./pages/donations/donations').then(m => m.Donations) },
  { path: 'donations/select-cases', loadComponent: () => import('./pages/donations/select-cases/select-cases').then(m => m.SelectCases) },
  { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },
];
