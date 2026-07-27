import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Product } from '../../../../products/domain';
import type { CatalogSelection, ProductGroup } from '../../../domain/models/product-group';
import {
  CatalogService,
  type GroupsState,
  type ProductsState,
} from '../../../domain/services/catalog.service';
import { CatalogPage } from './catalog-page';
import { CatalogPageFacade } from '../../facades/catalog-page.facade';

const group: ProductGroup = { id: 'home', slug: 'dlya-doma', name: 'Для дома' };
const product: Product = {
  id: 'lamp', name: 'Лампа', description: 'Свет', priceInCents: 349000,
  imageUrl: '/image.svg', stock: 0,
};

function setup(
  productState: ProductsState = { status: 'loaded', products: [product] },
  detectChanges = true,
) {
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
    activate: vi.fn(),
    activateUrlSelection: vi.fn(),
    retryGroups: vi.fn(),
    retryProducts: vi.fn(),
  };
  TestBed.configureTestingModule({
    imports: [CatalogPage],
    providers: [{ provide: CatalogService, useValue: service }, provideRouter([])],
  });
  const fixture = TestBed.createComponent(CatalogPage);
  if (detectChanges) fixture.detectChanges();
  return { fixture, service, groupsState, productsState, selection, canonicalization };
}

describe('CatalogPage', () => {
  it('does not read viewport or activate workflows during construction', () => {
    const originalMatchMedia = globalThis.matchMedia;
    const matchMediaSpy = vi.fn(() => ({ matches: false })) as unknown as typeof matchMedia;
    globalThis.matchMedia = matchMediaSpy;
    const { fixture, service } = setup({ status: 'idle' }, false);
    expect(matchMediaSpy).not.toHaveBeenCalled();
    expect(service.activate).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(matchMediaSpy).toHaveBeenCalledOnce();
    expect(service.activate).toHaveBeenCalledOnce();
    globalThis.matchMedia = originalMatchMedia;
  });

  it('activates the catalog through its facade lifecycle', () => {
    const { fixture, service } = setup();
    expect(service.activate).toHaveBeenCalledOnce();
    fixture.debugElement.injector.get(CatalogPageFacade).activate();
    expect(service.activate).toHaveBeenCalledOnce();
  });

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

  it('renders no result body for an unknown defensive state', () => {
    const { fixture } = setup({ status: 'unknown' } as unknown as ProductsState);
    expect(fixture.nativeElement.querySelector('.results').textContent.trim()).toBe('');
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

  it('closes through backdrop and selects all through navigation actions', () => {
    const { fixture } = setup();
    const trigger = fixture.nativeElement.querySelector('.catalog-trigger');
    trigger.click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.catalog-navigation__footer button').click();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/');
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).toBeNull();

    trigger.click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[role="option"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).toBeNull();

    trigger.click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.close-button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).toBeNull();

    trigger.click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.navigation-backdrop').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).toBeNull();
  });

  it('does not treat a non-button toggle target as a restore anchor', () => {
    const { fixture } = setup();
    const page = fixture.componentInstance as unknown as {
      toggleNavigation(target: EventTarget | null): void;
    };
    page.toggleNavigation(document.body);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).not.toBeNull();
  });

  it('closes desktop navigation on outside click while ignoring the trigger', () => {
    const originalMatchMedia = globalThis.matchMedia;
    globalThis.matchMedia = vi.fn(() => ({ matches: false })) as unknown as typeof matchMedia;
    const { fixture } = setup();
    const trigger = fixture.nativeElement.querySelector('.catalog-trigger');
    trigger.click();
    fixture.detectChanges();
    trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(fixture.nativeElement.querySelector('.catalog-navigation')).not.toBeNull();
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
