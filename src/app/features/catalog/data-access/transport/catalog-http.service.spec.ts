import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CatalogHttpService } from './catalog-http.service';

it('loads validated DTOs from the catalog endpoint', () => {
  TestBed.configureTestingModule({
    providers: [CatalogHttpService, provideHttpClient(), provideHttpClientTesting()],
  });
  const service = TestBed.inject(CatalogHttpService);
  const http = TestBed.inject(HttpTestingController);
  const response = [
    {
      id: 'tote',
      name: 'Сумка',
      description: 'Льняная',
      priceInCents: 10000,
      imageUrl: '/image.svg',
      stock: 2,
    },
  ];
  let actual: unknown;

  service.getProducts().subscribe((dtos) => (actual = dtos));
  const request = http.expectOne('/data/products.json');
  expect(request.request.method).toBe('GET');
  request.flush(response);

  expect(actual).toEqual(response);
  http.verify();
});
