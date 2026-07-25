import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Product } from '../../../domain/models/product';
import type { CatalogSelection, ProductGroup } from '../../../domain/models/product-group';
import {
  CatalogService,
  type GroupsState,
  type ProductsState,
} from '../../../domain/services/catalog.service';
import { CatalogPage } from './catalog-page';

const group: ProductGroup = { id: 'home', slug: 'dlya-doma', name: 'Для дома' };
const product: Product = {
  id: 'lamp', name: 'Лампа', description: 'Свет', priceInCents: 349000,
  imageUrl: '/image.svg', stock: 0,
};

interface PageControls {
  openNavigation(): void;
  closeNavigation(restoreFocus?: boolean): void;
  selectAll(): void;
  onOptionKeydown(event: KeyboardEvent): void;
  onNavigationKeydown(event: KeyboardEvent): void;
  onDocumentPointerDown(event: PointerEvent): void;
  focusNavigationTarget(): void;
}

function setup(productState: ProductsState = { status: 'loaded', products: [product] }) {
  const groupsState = signal<GroupsState>({ status: 'loaded', groups: [group] });
  const productsState = signal<ProductsState>(productState);
  const selection = signal<CatalogSelection>({ kind: 'all', name: 'Все товары' });
  const canonicalization = signal<{ id: number; announcement: string } | null>(null);
  const service = {
    groupsState,
    productsState,
    selection,
    canonicalization,
    groups: () => {
      const state = groupsState();
      return state.status === 'loaded' ? state.groups : [];
    },
    products: () => {
      const state = productsState();
      return state.status === 'loaded' ? state.products : [];
    },
    resultCount: () => {
      const state = productsState();
      return state.status === 'loaded' ? state.products.length : state.status === 'empty' ? 0 : null;
    },
    activateUrlSelection: vi.fn(),
    retryGroups: vi.fn(),
    retryProducts: vi.fn(),
  };
  TestBed.configureTestingModule({
    imports: [CatalogPage],
    providers: [{ provide: CatalogService, useValue: service }, provideRouter([])],
  });
  const fixture = TestBed.createComponent(CatalogPage);
  fixture.detectChanges();
  return { fixture, service, groupsState, productsState, selection, canonicalization };
}

describe('CatalogPage', () => {
  it('renders loaded products, price, count and availability', () => {
    const { fixture, productsState } = setup();
    expect(fixture.nativeElement.textContent).toContain('Все товары');
    expect(fixture.nativeElement.textContent).toContain('1 товаров');
    expect(fixture.nativeElement.textContent).toContain('3 490');
    expect(fixture.nativeElement.textContent).toContain('Нет в наличии');
    productsState.set({ status: 'loaded', products: [{ ...product, stock: 3 }] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('В наличии · 3 шт.');
  });

  it.each([
    [{ status: 'idle' }, ''] as const,
    [{ status: 'loading', mode: 'initial' }, 'Загружаем товары'] as const,
    [{ status: 'loading', mode: 'refetch' }, 'Обновляем товары'] as const,
    [{ status: 'empty' }, 'В магазине пока нет товаров'] as const,
  ])('renders product state %o', (state, copy) => {
    const { fixture } = setup(state);
    expect(fixture.nativeElement.textContent).toContain(copy);
  });

  it('renders selected empty action and product retry', () => {
    const empty = setup({ status: 'empty' });
    empty.selection.set({ kind: 'group', group, name: group.name } as const);
    empty.fixture.detectChanges();
    empty.fixture.nativeElement.querySelector('.state-card button').click();
    expect(TestBed.inject(Router).url).toBe('/');

    TestBed.resetTestingModule();
    const error = setup({ status: 'error' });
    error.fixture.nativeElement.querySelector('.state-card button').click();
    expect(error.service.retryProducts).toHaveBeenCalledOnce();
  });

  it('opens navigation, exposes ordered options and selects a group', async () => {
    const { fixture, selection } = setup();
    fixture.nativeElement.querySelector('.catalog-trigger').click();
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(2);
    expect(options[1].textContent).toContain('Для дома');
    options[1].click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toContain('group=dlya-doma');
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).toBeNull();
    selection.set({ kind: 'group', group, name: group.name });
    fixture.nativeElement.querySelector('.catalog-trigger').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);
  });

  it('renders scoped group failure and delegates its retry', () => {
    const { fixture, groupsState, service } = setup();
    groupsState.set({ status: 'error' });
    fixture.nativeElement.querySelector('.catalog-trigger').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.group-error').textContent).toContain('Категории временно недоступны');
    fixture.nativeElement.querySelector('.group-error button').click();
    expect(service.retryGroups).toHaveBeenCalledOnce();
  });

  it('supports option arrow navigation, escape and repeated-trigger close', () => {
    const { fixture } = setup();
    const trigger = fixture.nativeElement.querySelector('.catalog-trigger');
    trigger.click();
    fixture.detectChanges();
    const first = fixture.nativeElement.querySelector('[role="option"]') as HTMLElement;
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    const navigation = fixture.nativeElement.querySelector('.catalog-navigation');
    navigation.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).toBeNull();
    trigger.click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.catalog-trigger').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).toBeNull();
  });

  it('covers keyboard boundaries, mobile focus trap and outside-pointer close', () => {
    const originalMatchMedia = globalThis.matchMedia;
    globalThis.matchMedia = vi.fn(() => ({ matches: true })) as unknown as typeof matchMedia;
    const { fixture } = setup();
    const page = fixture.componentInstance as unknown as PageControls;
    page.onNavigationKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));
    page.openNavigation();
    fixture.detectChanges();
    const options = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"]'),
    ) as HTMLElement[];
    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Other']) {
      options[0].dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    }
    const navigation = fixture.nativeElement.querySelector('.catalog-navigation') as HTMLElement;
    const close = navigation.querySelector('.close-button') as HTMLElement;
    close.focus();
    navigation.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    const last = Array.from(navigation.querySelectorAll('button')).at(-1) as HTMLElement;
    last.focus();
    page.onNavigationKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));
    options[0].focus();
    page.onNavigationKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));
    navigation.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    page.onDocumentPointerDown(new PointerEvent('pointerdown'));
    page.closeNavigation(false);
    fixture.detectChanges();
    page.focusNavigationTarget();
    page.selectAll();
    globalThis.matchMedia = originalMatchMedia;
  });

  it('focuses group failure and falls back to All when a backend option disappears', () => {
    const { fixture, groupsState } = setup();
    const page = fixture.componentInstance as unknown as PageControls;
    page.openNavigation();
    fixture.detectChanges();
    groupsState.set({ status: 'error' });
    fixture.detectChanges();
    page.focusNavigationTarget();
    expect(document.activeElement?.id).toBe('group-error-title');

    groupsState.set({ status: 'loaded', groups: [group] });
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement>;
    options.forEach((option) => option.setAttribute('aria-selected', 'false'));
    page.focusNavigationTarget();
    expect(document.activeElement).toBe(options[0]);
  });

  it('ignores irrelevant pointer events and closes desktop navigation on outside click', () => {
    const originalMatchMedia = globalThis.matchMedia;
    globalThis.matchMedia = vi.fn(() => ({ matches: false })) as unknown as typeof matchMedia;
    const { fixture } = setup();
    const page = fixture.componentInstance as unknown as PageControls;
    page.onDocumentPointerDown(new PointerEvent('pointerdown'));
    page.openNavigation();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.catalog-trigger').dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).toBeNull();
    globalThis.matchMedia = originalMatchMedia;
  });

  it('canonicalizes through router replacement and announces recovery', async () => {
    const { fixture, canonicalization } = setup();
    const router = TestBed.inject(Router);
    await router.navigate([], { queryParams: { campaign: 'spring', group: 'removed' } });
    const navigate = vi.spyOn(router, 'navigate');
    canonicalization.set({ id: 1, announcement: 'Категория недоступна. Показаны все товары' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Категория недоступна');
    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { group: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    }));
    expect(router.url).toBe('/?campaign=spring');
  });

  it('normalizes empty and duplicate group query values before domain activation', async () => {
    const { fixture, service } = setup();
    const router = TestBed.inject(Router);
    await router.navigate([], { queryParams: { group: '' } });
    await router.navigate([], { queryParams: { group: ['one', 'two'] } });
    fixture.detectChanges();
    expect(service.activateUrlSelection).toHaveBeenCalledWith('');
  });
});
