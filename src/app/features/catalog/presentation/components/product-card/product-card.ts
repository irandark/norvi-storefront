import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Product } from '../../../../products/domain';
import { RubPricePipe } from '../../pipes/rub-price.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RubPricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <article class="product-card" data-testid="product-card">
      <div class="product-card__image">
        <img [src]="product().imageUrl" [alt]="product().name" width="640" height="480" />
      </div>
      <div class="product-card__body">
        <h2>{{ product().name }}</h2>
        <p>{{ product().description }}</p>
        <strong>{{ product().priceInCents | rubPrice }}</strong>
        @if (product().stock === 0) {
          <span class="stock stock--empty">Нет в наличии</span>
        } @else {
          <span class="stock">В наличии · {{ product().stock }} шт.</span>
        }
      </div>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
}
