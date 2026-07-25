import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { Product } from '../../domain/models/product';
import type { ProductGroup } from '../../domain/models/product-group';
import { ProductCatalogRepository } from '../../domain/ports/product-catalog.repository';
import { mapProductDto } from '../mappers/product.mapper';
import { mapProductGroupDto } from '../mappers/product-group.mapper';
import { CatalogHttpService } from '../transport/catalog-http.service';

@Injectable()
export class HttpProductCatalogRepository extends ProductCatalogRepository {
  private readonly transport = inject(CatalogHttpService);

  override getGroups(): Observable<readonly ProductGroup[]> {
    return this.transport.getGroups().pipe(map((dtos) => dtos.map(mapProductGroupDto)));
  }

  override getProducts(groupId?: string): Observable<readonly Product[]> {
    return this.transport.getProducts(groupId).pipe(map((dtos) => dtos.map(mapProductDto)));
  }
}
