import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { Product } from '../../domain/models/product';
import { ProductCatalogRepository } from '../../domain/ports/product-catalog.repository';
import { mapProductDto } from '../mappers/product.mapper';
import { CatalogHttpService } from '../transport/catalog-http.service';

@Injectable()
export class HttpProductCatalogRepository extends ProductCatalogRepository {
  private readonly transport = inject(CatalogHttpService);

  override getProducts(): Observable<readonly Product[]> {
    return this.transport.getProducts().pipe(map((dtos) => dtos.map((dto) => mapProductDto(dto))));
  }
}
