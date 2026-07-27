import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Product } from '../../../../products/domain';
import type { CatalogSelection } from '../../../domain/models/product-group';
import type { ProductsState } from '../../../domain/services/catalog.service';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-catalog-results',
  imports: [ProductCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-results.html',
  styleUrl: './catalog-results.css',
})
export class CatalogResults {
  protected readonly skeletons = [1, 2, 3, 4];
  readonly state = input.required<ProductsState>();
  readonly selection = input.required<CatalogSelection>();
  readonly products = input.required<readonly Product[]>();
  readonly resultCount = input.required<number | null>();
  readonly retry = output<void>();
  readonly showAll = output<void>();

  protected loadingLabel(): string {
    const state = this.state();
    return state.status === 'loading' && state.mode === 'refetch'
      ? 'Обновляем товары'
      : 'Загружаем товары';
  }
}
