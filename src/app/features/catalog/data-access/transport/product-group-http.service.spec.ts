import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductGroupHttpService } from './product-group-http.service';

describe('ProductGroupHttpService', () => {
  let service: ProductGroupHttpService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductGroupHttpService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductGroupHttpService);
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
});
