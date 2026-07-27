import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import type { ProductGroup } from '../../domain/models/product-group';
import { ProductGroupRepository } from '../../domain/ports/product-group.repository';
import { mapProductGroupDto } from '../mappers/product-group.mapper';
import { ProductGroupHttpService } from '../transport/product-group-http.service';

@Injectable()
export class HttpProductGroupRepository extends ProductGroupRepository {
  private readonly transport = inject(ProductGroupHttpService);

  override getGroups(): Observable<readonly ProductGroup[]> {
    return this.transport.getGroups().pipe(map((dtos) => dtos.map(mapProductGroupDto)));
  }
}
