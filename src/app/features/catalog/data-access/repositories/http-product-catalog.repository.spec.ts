import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CatalogHttpService } from '../transport/catalog-http.service';
import { HttpProductCatalogRepository } from './http-product-catalog.repository';

it('returns domain products mapped from transport DTOs', () => {
  const dto = {
    id: 'tote',
    name: 'Сумка',
    description: 'Льняная',
    priceInCents: 10000,
    imageUrl: '/image.svg',
    stock: 2,
  };
  TestBed.configureTestingModule({
    providers: [
      HttpProductCatalogRepository,
      { provide: CatalogHttpService, useValue: { getProducts: () => of([dto]) } },
    ],
  });
  let actual: unknown;

  TestBed.inject(HttpProductCatalogRepository)
    .getProducts()
    .subscribe((products) => (actual = products));

  expect(actual).toEqual([dto]);
  expect((actual as object[])[0]).not.toBe(dto);
});
