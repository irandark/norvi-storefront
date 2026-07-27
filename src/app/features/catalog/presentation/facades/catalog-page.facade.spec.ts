import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import type { CatalogSelection, ProductGroup } from '../../domain/models/product-group';
import { CatalogService, type ProductsState } from '../../domain/services/catalog.service';
import { CatalogPageFacade } from './catalog-page.facade';

describe('CatalogPageFacade', () => {
  const group: ProductGroup = { id: 'home', slug: 'home', name: 'Home' };

  function setup(staleCanonicalization: { id: number; announcement: string } | null = null) {
    const query = new BehaviorSubject(convertToParamMap({ group: 'home' }));
    const canonicalization = signal(staleCanonicalization);
    const service = {
      groupsState: signal({ status: 'loaded', groups: [group] }),
      productsState: signal<ProductsState>({ status: 'loaded', products: [] }),
      selection: signal<CatalogSelection>({ kind: 'all', name: 'Все товары' }),
      groups: signal([group]),
      products: signal([]),
      resultCount: signal(0),
      canonicalization,
      activate: vi.fn(),
      activateUrlSelection: vi.fn(),
      retryGroups: vi.fn(),
      retryProducts: vi.fn(),
    };
    const router = { navigate: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({
      providers: [
        CatalogPageFacade,
        { provide: CatalogService, useValue: service },
        { provide: ActivatedRoute, useValue: { queryParamMap: query.asObservable() } },
        { provide: Router, useValue: router },
      ],
    });
    return { facade: TestBed.inject(CatalogPageFacade), service, router, query, canonicalization };
  }

  it('is inert until one explicit activation and ignores a stale canonicalization', () => {
    const { facade, service, router } = setup({ id: 7, announcement: 'stale' });
    TestBed.tick();
    expect(service.activate).not.toHaveBeenCalled();
    expect(service.activateUrlSelection).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();

    facade.activate();
    facade.activate();
    TestBed.tick();
    expect(service.activate).toHaveBeenCalledOnce();
    expect(service.activateUrlSelection).toHaveBeenCalledOnce();
    expect(service.activateUrlSelection).toHaveBeenCalledWith('home');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('normalizes route values and handles only new canonicalization instructions', () => {
    const { facade, service, router, query, canonicalization } = setup();
    facade.activate();
    query.next(convertToParamMap({ group: ['', 'duplicate'] }));
    canonicalization.set({ id: 1, announcement: 'recovered' });
    TestBed.tick();
    expect(service.activateUrlSelection).toHaveBeenLastCalledWith('');
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { group: null },
      replaceUrl: true,
    }));
    expect(facade.liveAnnouncement()).toBe('recovered');
    service.productsState.set({ status: 'error' });
    facade.retryProducts();
    service.productsState.set({ status: 'loading', mode: 'refetch' });
    expect(facade.liveAnnouncement()).toBe('Обновляем товары: Все товары');
  });

  it('derives product announcements without synchronizing writable state', () => {
    const { facade, service } = setup();
    facade.activate();
    service.productsState.set({ status: 'loading', mode: 'initial' });
    expect(facade.liveAnnouncement()).toBe('Загружаем товары');
    service.productsState.set({ status: 'loading', mode: 'refetch' });
    expect(facade.liveAnnouncement()).toBe('Обновляем товары: Все товары');
    service.productsState.set({ status: 'loaded', products: [] });
    expect(facade.liveAnnouncement()).toBe('0 товаров, Все товары');
  });

  it('delegates selections and retries', () => {
    const { facade, service, router } = setup();
    facade.selectGroup(group);
    facade.selectAll();
    facade.retryGroups();
    facade.retryProducts();
    expect(router.navigate).toHaveBeenNthCalledWith(1, [], expect.objectContaining({
      queryParams: { group: 'home' },
    }));
    expect(router.navigate).toHaveBeenNthCalledWith(2, [], expect.objectContaining({
      queryParams: { group: null },
    }));
    expect(service.retryGroups).toHaveBeenCalledOnce();
    expect(service.retryProducts).toHaveBeenCalledOnce();
  });
});
