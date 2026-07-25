import { computed, inject, Injectable, signal } from '@angular/core';
import { Subscription, take } from 'rxjs';
import type { Product } from '../models/product';
import type { CatalogSelection, ProductGroup } from '../models/product-group';
import { ProductCatalogRepository } from '../ports/product-catalog.repository';

export type GroupsState =
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly groups: readonly ProductGroup[] }
  | { readonly status: 'error' };

export type ProductsState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading'; readonly mode: 'initial' | 'refetch' }
  | { readonly status: 'empty' }
  | { readonly status: 'loaded'; readonly products: readonly Product[] }
  | { readonly status: 'error' };

export interface CanonicalizationInstruction {
  readonly id: number;
  readonly announcement: string;
}

@Injectable()
export class CatalogService {
  private readonly repository = inject(ProductCatalogRepository);
  private readonly groupsSource = signal<GroupsState>({ status: 'loading' });
  private readonly productsSource = signal<ProductsState>({ status: 'idle' });
  private readonly selectionSource = signal<CatalogSelection>({ kind: 'all', name: 'Все товары' });
  private readonly canonicalizationSource = signal<CanonicalizationInstruction | null>(null);
  private requestedSlug: string | null | undefined;
  private productSubscription?: Subscription;
  private hasRequestedProducts = false;
  private canonicalizationId = 0;

  readonly groupsState = this.groupsSource.asReadonly();
  readonly productsState = this.productsSource.asReadonly();
  readonly selection = this.selectionSource.asReadonly();
  readonly canonicalization = this.canonicalizationSource.asReadonly();
  readonly groups = computed(() => {
    const state = this.groupsState();
    return state.status === 'loaded' ? state.groups : [];
  });
  readonly products = computed(() => {
    const state = this.productsState();
    return state.status === 'loaded' ? state.products : [];
  });
  readonly resultCount = computed(() => {
    const state = this.productsState();
    return state.status === 'loaded' ? state.products.length : state.status === 'empty' ? 0 : null;
  });

  constructor() {
    this.loadGroups();
  }

  activateUrlSelection(slug: string | null): void {
    this.requestedSlug = slug;
    const groups = this.groupsState();
    if (groups.status === 'loaded') {
      this.resolveSelection(groups.groups);
    } else if (groups.status === 'error') {
      this.selectAllAndLoad(false);
    }
  }

  retryGroups(): void {
    this.loadGroups();
  }

  retryProducts(): void {
    this.loadProducts(this.selection());
  }

  private loadGroups(): void {
    this.groupsSource.set({ status: 'loading' });
    this.repository
      .getGroups()
      .pipe(take(1))
      .subscribe({
        next: (groups) => {
          this.groupsSource.set({ status: 'loaded', groups });
          if (this.requestedSlug !== undefined) this.resolveSelection(groups);
        },
        error: () => {
          this.groupsSource.set({ status: 'error' });
          if (this.requestedSlug !== undefined) this.selectAllAndLoad(false);
        },
      });
  }

  private resolveSelection(groups: readonly ProductGroup[]): void {
    if (this.requestedSlug === null) {
      this.selectAllAndLoad(false);
      return;
    }

    const group = groups.find(({ slug }) => slug === this.requestedSlug);
    if (group) {
      const next: CatalogSelection = { kind: 'group', group, name: group.name };
      this.selectionSource.set(next);
      this.loadProducts(next);
      return;
    }

    this.selectAllAndLoad(true);
  }

  private selectAllAndLoad(canonicalize: boolean): void {
    const selection: CatalogSelection = { kind: 'all', name: 'Все товары' };
    this.selectionSource.set(selection);
    if (canonicalize) {
      this.canonicalizationSource.set({
        id: ++this.canonicalizationId,
        announcement: 'Категория недоступна. Показаны все товары',
      });
    }
    this.loadProducts(selection);
  }

  private loadProducts(selection: CatalogSelection): void {
    this.productSubscription?.unsubscribe();
    this.productsSource.set({
      status: 'loading',
      mode: this.hasRequestedProducts ? 'refetch' : 'initial',
    });
    this.hasRequestedProducts = true;

    const groupId = selection.kind === 'group' ? selection.group.id : undefined;
    this.productSubscription = this.repository
      .getProducts(groupId)
      .pipe(take(1))
      .subscribe({
        next: (products) => {
          this.productsSource.set(
            products.length === 0 ? { status: 'empty' } : { status: 'loaded', products },
          );
        },
        error: () => {
          this.productsSource.set({ status: 'error' });
        },
      });
  }
}
