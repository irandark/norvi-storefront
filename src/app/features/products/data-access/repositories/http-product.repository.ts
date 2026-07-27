import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { ProductRepository, type Product } from '../../domain';
import { mapProductDto } from '../mappers/product.mapper';
import { ProductHttpService } from '../transport/product-http.service';

@Injectable()
export class HttpProductRepository extends ProductRepository {
  private readonly transport = inject(ProductHttpService);

  override getProducts(groupId?: string): Observable<readonly Product[]> {
    return this.transport.getProducts(groupId).pipe(map((dtos) => dtos.map(mapProductDto)));
  }
}
