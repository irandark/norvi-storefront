import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-catalog-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <header class="site-header" [attr.inert]="navigationOpen() && mobileViewport() ? '' : null">
      <div class="utility-strip"><span>Москва · Доставка сегодня</span></div>
      <div class="site-header__top">
        <a class="brand" href="/" aria-label="НОРВИ — главная"><span class="brand-mark" aria-hidden="true">✦</span><span>НОРВИ</span></a>
        <div class="header-actions" aria-label="Будущие возможности">
          <span class="search-placeholder">Найти товар или категорию</span>
          <span class="cart-placeholder">Корзина</span>
        </div>
      </div>
      <nav class="primary-navigation" aria-label="Основная навигация">
        <button
          class="catalog-trigger"
          type="button"
          aria-label="Каталог товаров"
          [attr.aria-expanded]="navigationOpen()"
          aria-controls="catalog-navigation"
          (click)="toggleRequested.emit($event.currentTarget)"
        >
          <span aria-hidden="true">☰</span> Каталог
        </button>
        <span>Новинки</span><span>Для дома</span><span>Поддержка</span>
      </nav>
    </header>
  `,
})
export class CatalogHeader {
  readonly navigationOpen = input.required<boolean>();
  readonly mobileViewport = input.required<boolean>();
  readonly toggleRequested = output<EventTarget | null>();
}
