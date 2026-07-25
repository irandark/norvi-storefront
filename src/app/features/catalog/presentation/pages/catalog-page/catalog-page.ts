import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CatalogService } from '../../../domain/services/catalog.service';

@Component({
  selector: 'app-catalog-page',
  imports: [],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  protected readonly catalog = inject(CatalogService);

  protected formatPrice(priceInCents: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(priceInCents / 100);
  }
}
