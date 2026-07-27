import type { Observable } from 'rxjs';

import type { ProductGroup } from '../models/product-group';

export abstract class ProductGroupRepository {
  abstract getGroups(): Observable<readonly ProductGroup[]>;
}
