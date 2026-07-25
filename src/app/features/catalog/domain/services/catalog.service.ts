import { computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import type { Product } from '../models/product';
import { ProductCatalogRepository } from '../ports/product-catalog.repository';

export type CatalogState =
  | { readonly status: 'loading' }
  | { readonly status: 'empty' }
  | { readonly status: 'loaded'; readonly products: readonly Product[] }
  | { readonly status: 'error' };

@Injectable()
export class CatalogService {
  private readonly repository = inject(ProductCatalogRepository);
  private readonly stateSource = signal<CatalogState>({ status: 'loading' });

  readonly state = this.stateSource.asReadonly();
  readonly products = computed(() => {
    const state = this.state();
    return state.status === 'loaded' ? state.products : [];
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.stateSource.set({ status: 'loading' });
    this.repository
      .getProducts()
      .pipe(take(1))
      .subscribe({
        next: (products) =>
          this.stateSource.set(
            products.length === 0 ? { status: 'empty' } : { status: 'loaded', products },
          ),
        error: () => this.stateSource.set({ status: 'error' }),
      });
  }
}
