import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ProductRepository, type Product } from '../../../products/domain';
import type { ProductGroup } from '../models/product-group';
import { ProductGroupRepository } from '../ports/product-group.repository';
import { CatalogService } from './catalog.service';

const group: ProductGroup = { id: 'kitchen id', slug: 'kuhnya', name: 'Кухня' };
const product: Product = {
  id: 'kettle', name: 'Чайник', description: 'Тихий', priceInCents: 10000,
  imageUrl: '/image.svg', stock: 2,
};

function setup() {
  const groupResponses: Subject<readonly ProductGroup[]>[] = [];
  const productResponses: Subject<readonly Product[]>[] = [];
  const groupRepository = {
    getGroups: vi.fn(() => {
      const response = new Subject<readonly ProductGroup[]>();
      groupResponses.push(response);
      return response;
    }),
  };
  const productRepository = {
    getProducts: vi.fn(() => {
      const response = new Subject<readonly Product[]>();
      productResponses.push(response);
      return response;
    }),
  };
  TestBed.configureTestingModule({
    providers: [
      CatalogService,
      { provide: ProductGroupRepository, useValue: groupRepository },
      { provide: ProductRepository, useValue: productRepository },
    ],
  });
  return {
    service: TestBed.inject(CatalogService),
    groupRepository,
    productRepository,
    groupResponses,
    productResponses,
  };
}

describe('CatalogService', () => {
  it('is inert until explicitly activated and activates only once', () => {
    const { service, groupRepository, productRepository, groupResponses } = setup();

    expect(service.groupsState()).toEqual({ status: 'idle' });
    expect(groupRepository.getGroups).not.toHaveBeenCalled();
    expect(productRepository.getProducts).not.toHaveBeenCalled();

    service.activate();
    service.activate();

    expect(service.groupsState()).toEqual({ status: 'loading' });
    expect(groupRepository.getGroups).toHaveBeenCalledOnce();
    expect(groupResponses).toHaveLength(1);
  });

  it('loads groups, resolves a URL group and exposes products and count', () => {
    const { service, productRepository, groupResponses, productResponses } = setup();
    service.activateUrlSelection('kuhnya');
    service.activate();
    groupResponses[0].next([group]);
    expect(service.groups()).toEqual([group]);
    expect(service.selection()).toEqual({ kind: 'group', group, name: 'Кухня' });
    expect(productRepository.getProducts).toHaveBeenCalledWith('kitchen id');
    expect(service.productsState()).toEqual({ status: 'loading', mode: 'initial' });
    expect(service.resultCount()).toBeNull();
    productResponses[0].next([product]);
    expect(service.products()).toEqual([product]);
    expect(service.resultCount()).toBe(1);
  });

  it('loads all products for no query and represents an empty response', () => {
    const { service, productRepository, groupResponses, productResponses } = setup();
    service.activateUrlSelection(null);
    service.activate();
    groupResponses[0].next([]);
    expect(productRepository.getProducts).toHaveBeenCalledWith(undefined);
    productResponses[0].next([]);
    expect(service.productsState()).toEqual({ status: 'empty' });
    expect(service.products()).toEqual([]);
    expect(service.resultCount()).toBe(0);
  });

  it('canonicalizes unknown slugs and emits a recovery announcement', () => {
    const { service, groupResponses } = setup();
    service.activateUrlSelection('gone');
    service.activate();
    groupResponses[0].next([group]);
    expect(service.selection().kind).toBe('all');
    expect(service.canonicalization()).toMatchObject({
      id: 1, announcement: 'Категория недоступна. Показаны все товары',
    });
  });

  it('keeps all-products usable when groups fail and retries groups independently', () => {
    const { service, productRepository, groupResponses, productResponses } = setup();
    service.activateUrlSelection('kuhnya');
    service.activate();
    groupResponses[0].error(new Error('offline'));
    expect(service.groupsState()).toEqual({ status: 'error' });
    expect(service.groups()).toEqual([]);
    service.activateUrlSelection(null);
    expect(productRepository.getProducts).toHaveBeenCalledWith(undefined);
    productResponses[1].error(new Error('offline'));
    expect(service.productsState()).toEqual({ status: 'error' });
    service.retryProducts();
    expect(service.productsState()).toEqual({ status: 'loading', mode: 'refetch' });
    service.activateUrlSelection('kuhnya');
    service.retryGroups();
    expect(service.groupsState()).toEqual({ status: 'loading' });
    groupResponses[1].next([group]);
    expect(service.selection().kind).toBe('group');
    expect(service.productsState()).toEqual({ status: 'loading', mode: 'refetch' });
  });

  it('makes the latest product request authoritative', () => {
    const { service, groupResponses, productResponses } = setup();
    service.activate();
    groupResponses[0].next([group]);
    service.activateUrlSelection(null);
    service.activateUrlSelection('kuhnya');
    expect(productResponses).toHaveLength(2);
    productResponses[0].next([{ ...product, id: 'old' }]);
    expect(service.products()).toEqual([]);
    productResponses[1].next([product]);
    expect(service.products()).toEqual([product]);
  });

  it('waits for URL activation when groups resolve first and suppresses a stale error', () => {
    const { service, productRepository, groupResponses, productResponses } = setup();
    service.activate();
    groupResponses[0].next([group]);
    expect(service.productsState()).toEqual({ status: 'idle' });
    expect(productRepository.getProducts).not.toHaveBeenCalled();

    service.activateUrlSelection(null);
    service.activateUrlSelection('kuhnya');
    productResponses[0].error(new Error('stale failure'));
    expect(service.productsState()).toEqual({ status: 'loading', mode: 'refetch' });
    productResponses[1].next([product]);
    expect(service.productsState()).toEqual({ status: 'loaded', products: [product] });
  });

  it('waits for URL activation when the group request fails first', () => {
    const { service, productRepository, groupResponses } = setup();
    service.activate();
    groupResponses[0].error(new Error('offline'));
    expect(productRepository.getProducts).not.toHaveBeenCalled();
    service.activateUrlSelection(null);
    expect(productRepository.getProducts).toHaveBeenCalledWith(undefined);
  });
});
