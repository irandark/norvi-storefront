import { TestBed } from '@angular/core/testing';

import { appConfig } from '../../../../app.config';
import { ProductCatalogRepository } from '../../domain/ports/product-catalog.repository';
import { HttpProductCatalogRepository } from './http-product-catalog.repository';

it('wires the catalog domain port to its HTTP repository adapter', () => {
  TestBed.configureTestingModule({ providers: appConfig.providers });

  expect(TestBed.inject(ProductCatalogRepository)).toBeInstanceOf(HttpProductCatalogRepository);
});
