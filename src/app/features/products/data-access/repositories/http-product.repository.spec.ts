import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProductHttpService } from '../transport/product-http.service';
import { HttpProductRepository } from './http-product.repository';

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
      HttpProductRepository,
      { provide: ProductHttpService, useValue: { getProducts: () => of([dto]) } },
    ],
  });
  let actual: unknown;

  TestBed.inject(HttpProductRepository)
    .getProducts()
    .subscribe((products) => (actual = products));

  expect(actual).toEqual([dto]);
  expect((actual as object[])[0]).not.toBe(dto);
});
