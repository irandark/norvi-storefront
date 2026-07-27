import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Product } from '../../../../products/domain';
import { RubPricePipe } from '../../pipes/rub-price.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RubPricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();
}
