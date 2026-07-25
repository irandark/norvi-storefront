import { Observable } from 'rxjs';
import type { Product } from '../models/product';
import type { ProductGroup } from '../models/product-group';

export abstract class ProductCatalogRepository {
  abstract getGroups(): Observable<readonly ProductGroup[]>;
  abstract getProducts(groupId?: string): Observable<readonly Product[]>;
}
