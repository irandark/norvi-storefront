import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/catalog/presentation/pages/catalog-page/catalog-page').then(
        (module) => module.CatalogPage,
      ),
  },
];
