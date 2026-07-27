import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'rubPrice' })
export class RubPricePipe implements PipeTransform {
  transform(priceInCents: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(priceInCents / 100);
  }
}
