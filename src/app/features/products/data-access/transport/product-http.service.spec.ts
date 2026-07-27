import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductHttpService } from './product-http.service';

describe('ProductHttpService', () => {
  let service: ProductHttpService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductHttpService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductHttpService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads all products without a query', () => {
    service.getProducts().subscribe();
    expect(http.expectOne('/api/products').request.params.keys()).toEqual([]);
  });

  it('serializes a group id as an HTTP query parameter', () => {
    service.getProducts('kitchen & home').subscribe();
    const request = http.expectOne('/api/products?groupId=kitchen%20%26%20home');
    expect(request.request.method).toBe('GET');
  });

  it('propagates validation failures from the product boundary', () => {
    let error: unknown;
    service.getProducts().subscribe({ error: (value) => (error = value) });
    http.expectOne('/api/products').flush({});
    expect(error).toBeInstanceOf(Error);
  });
});
