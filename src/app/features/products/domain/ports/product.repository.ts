import type { Observable } from 'rxjs';

import type { Product } from '../models/product';

export abstract class ProductRepository {
  abstract getProducts(groupId?: string): Observable<readonly Product[]>;
}
