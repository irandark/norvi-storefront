import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CatalogHttpService } from './catalog-http.service';

describe('CatalogHttpService', () => {
  let service: CatalogHttpService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CatalogHttpService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogHttpService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads validated groups from the exact endpoint', () => {
    const response = [{ id: 'home', slug: 'dlya-doma', name: 'Для дома' }];
    let actual: unknown;
    service.getGroups().subscribe((value) => (actual = value));
    const request = http.expectOne('/api/product-groups');
    expect(request.request.method).toBe('GET');
    request.flush(response);
    expect(actual).toEqual(response);
  });

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
