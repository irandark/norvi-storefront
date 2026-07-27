import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { parseProductGroupDtos } from '../dto/parse-product-group-dtos';
import type { ProductGroupDto } from '../dto/product-group.dto';

@Injectable()
export class ProductGroupHttpService {
  private readonly http = inject(HttpClient);

  getGroups(): Observable<readonly ProductGroupDto[]> {
    return this.http
      .get<unknown>('/api/product-groups')
      .pipe(map((response) => parseProductGroupDtos(response)));
  }
}
