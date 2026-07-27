import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { parseProductDtos } from '../dto/parse-product-dtos';
import type { ProductDto } from '../dto/product.dto';

@Injectable()
export class ProductHttpService {
  private readonly http = inject(HttpClient);

  getProducts(groupId?: string): Observable<readonly ProductDto[]> {
    return this.http
      .get<unknown>('/api/products', groupId === undefined ? {} : { params: { groupId } })
      .pipe(map((response) => parseProductDtos(response)));
  }
}
