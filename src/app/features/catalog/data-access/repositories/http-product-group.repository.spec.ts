import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProductGroupHttpService } from '../transport/product-group-http.service';
import { HttpProductGroupRepository } from './http-product-group.repository';

it('returns domain groups mapped from transport DTOs', () => {
  const dto = { id: 'home', slug: 'home', name: 'Дом' };
  TestBed.configureTestingModule({
    providers: [
      HttpProductGroupRepository,
      { provide: ProductGroupHttpService, useValue: { getGroups: () => of([dto]) } },
    ],
  });
  let actual: unknown;

  TestBed.inject(HttpProductGroupRepository)
    .getGroups()
    .subscribe((groups) => (actual = groups));

  expect(actual).toEqual([dto]);
  expect((actual as object[])[0]).not.toBe(dto);
});
