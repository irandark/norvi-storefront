import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { ProductDto } from '../dto/product.dto';
import { parseProductDtos } from '../dto/parse-product-dtos';
import type { ProductGroupDto } from '../dto/product-group.dto';
import { parseProductGroupDtos } from '../dto/parse-product-group-dtos';

@Injectable()
export class CatalogHttpService {
  private readonly http = inject(HttpClient);

  getGroups(): Observable<readonly ProductGroupDto[]> {
    return this.http
      .get<unknown>('/api/product-groups')
      .pipe(map((response) => parseProductGroupDtos(response)));
  }

  getProducts(groupId?: string): Observable<readonly ProductDto[]> {
    return this.http
      .get<unknown>('/api/products', groupId === undefined ? {} : { params: { groupId } })
      .pipe(map((response) => parseProductDtos(response)));
  }
}
