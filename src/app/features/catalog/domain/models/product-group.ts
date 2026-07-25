export interface ProductGroup {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
}

export type CatalogSelection =
  | { readonly kind: 'all'; readonly name: 'Все товары' }
  | { readonly kind: 'group'; readonly group: ProductGroup; readonly name: string };
