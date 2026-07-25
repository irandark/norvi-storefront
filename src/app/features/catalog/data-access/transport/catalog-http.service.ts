import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { ProductDto } from '../dto/product.dto';
import { parseProductDtos } from '../dto/parse-product-dtos';

@Injectable()
export class CatalogHttpService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<readonly ProductDto[]> {
    return this.http
      .get<unknown>('/data/products.json')
      .pipe(map((response) => parseProductDtos(response)));
  }
}
