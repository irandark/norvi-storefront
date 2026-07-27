import { TestBed } from '@angular/core/testing';

import { appConfig } from '../../../../app.config';
import { ProductRepository } from '../../domain';
import { HttpProductRepository } from './http-product.repository';

it('wires the product domain port to its HTTP repository adapter', () => {
  TestBed.configureTestingModule({ providers: appConfig.providers });

  expect(TestBed.inject(ProductRepository)).toBeInstanceOf(HttpProductRepository);
});
