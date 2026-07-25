import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';
import { HttpProductCatalogRepository } from './features/catalog/data-access/repositories/http-product-catalog.repository';
import { ProductCatalogRepository } from './features/catalog/domain/ports/product-catalog.repository';

it('wires the catalog domain port to its HTTP repository adapter', () => {
  TestBed.configureTestingModule({ providers: appConfig.providers });
  expect(TestBed.inject(ProductCatalogRepository)).toBeInstanceOf(HttpProductCatalogRepository);
});
