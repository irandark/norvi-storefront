import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Product } from '../../../domain/models/product';
import { CatalogService, type CatalogState } from '../../../domain/services/catalog.service';
import { CatalogPage } from './catalog-page';

const product: Product = {
  id: 'tote',
  name: 'Льняная сумка',
  description: 'Лёгкая сумка',
  priceInCents: 349000,
  imageUrl: '/image.svg',
  stock: 0,
};

function setup(initialState: CatalogState) {
  const state = signal(initialState);
  const service = {
    state: state.asReadonly(),
    products: computed(() => {
      const current = state();
      return current.status === 'loaded' ? current.products : [];
    }),
    reload: vi.fn(),
  };
  TestBed.configureTestingModule({
    imports: [CatalogPage],
    providers: [{ provide: CatalogService, useValue: service }],
  });
  const fixture = TestBed.createComponent(CatalogPage);
  fixture.detectChanges();
  return { fixture, service, state };
}

describe('CatalogPage', () => {
  it('renders domain loading state', () => {
    const { fixture } = setup({ status: 'loading' });
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Загружаем',
    );
  });

  it('renders domain products and availability', () => {
    const { fixture } = setup({ status: 'loaded', products: [product] });
    expect(fixture.nativeElement.querySelectorAll('[data-testid="product-card"]')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Льняная сумка');
    expect(fixture.nativeElement.textContent).toContain('Нет в наличии');
  });

  it('renders the available stock quantity', () => {
    const { fixture } = setup({
      status: 'loaded',
      products: [{ ...product, stock: 3 }],
    });

    expect(fixture.nativeElement.textContent).toContain('В наличии · 3 шт.');
  });

  it('renders the domain empty state', () => {
    const { fixture } = setup({ status: 'empty' });
    expect(fixture.nativeElement.querySelector('[data-testid="catalog-empty"]')).toBeTruthy();
  });

  it('delegates retry to the domain service', () => {
    const { fixture, service } = setup({ status: 'error' });
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Не удалось загрузить товары',
    );

    fixture.nativeElement.querySelector('button').click();

    expect(service.reload).toHaveBeenCalledOnce();
  });
});
