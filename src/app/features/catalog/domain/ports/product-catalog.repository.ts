import { Observable } from 'rxjs';
import type { Product } from '../models/product';

export abstract class ProductCatalogRepository {
  abstract getProducts(): Observable<readonly Product[]>;
}
