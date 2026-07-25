import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import type { Product } from '../models/product';
import { ProductCatalogRepository } from '../ports/product-catalog.repository';
import { CatalogService } from './catalog.service';

const product: Product = {
  id: 'tote',
  name: 'Сумка',
  description: 'Льняная',
  priceInCents: 10000,
  imageUrl: '/image.svg',
  stock: 2,
};

describe('CatalogService', () => {
  it('owns loading, success, empty, failure and retry transitions', () => {
    const first = new Subject<readonly Product[]>();
    const second = new Subject<readonly Product[]>();
    const responses = [first, second];
    const repository = { getProducts: vi.fn(() => responses.shift()!) };

    TestBed.configureTestingModule({
      providers: [CatalogService, { provide: ProductCatalogRepository, useValue: repository }],
    });
    const service = TestBed.inject(CatalogService);

    expect(service.state()).toEqual({ status: 'loading' });
    first.error(new Error('offline'));
    expect(service.state()).toEqual({ status: 'error' });

    service.reload();
    expect(service.state()).toEqual({ status: 'loading' });
    second.next([product]);
    expect(service.state()).toEqual({ status: 'loaded', products: [product] });
    expect(service.products()).toEqual([product]);
    expect(repository.getProducts).toHaveBeenCalledTimes(2);
  });

  it('represents an empty repository result as loaded with no products', () => {
    const response = new Subject<readonly Product[]>();
    TestBed.configureTestingModule({
      providers: [
        CatalogService,
        {
          provide: ProductCatalogRepository,
          useValue: { getProducts: () => response },
        },
      ],
    });
    const service = TestBed.inject(CatalogService);

    response.next([]);

    expect(service.state()).toEqual({ status: 'empty' });
    expect(service.products()).toEqual([]);
  });
});
