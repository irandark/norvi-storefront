import { TestBed } from '@angular/core/testing';

import { appConfig } from '../../../../app.config';
import { ProductGroupRepository } from '../../domain';
import { HttpProductGroupRepository } from './http-product-group.repository';

it('wires the catalog domain port to its HTTP repository adapter', () => {
  TestBed.configureTestingModule({ providers: appConfig.providers });

  expect(TestBed.inject(ProductGroupRepository)).toBeInstanceOf(HttpProductGroupRepository);
});
