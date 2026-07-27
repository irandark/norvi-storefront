import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { CatalogSelection, ProductGroup } from '../../../domain/models/product-group';
import type { GroupsState } from '../../../domain/services/catalog.service';
import { BodyScrollLockDirective } from '../../../../../shared/presentation/directives/body-scroll-lock.directive';
import { FocusTrapRestoreDirective } from '../../../../../shared/presentation/directives/focus-trap-restore.directive';
import { OutsideClickDirective } from '../../../../../shared/presentation/directives/outside-click.directive';
import { RovingFocusDirective } from '../../../../../shared/presentation/directives/roving-focus.directive';

@Component({
  selector: 'app-catalog-navigation',
  imports: [
    BodyScrollLockDirective,
    FocusTrapRestoreDirective,
    OutsideClickDirective,
    RovingFocusDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <button class="navigation-backdrop" type="button" aria-label="Закрыть каталог" (click)="closeRequested.emit()"></button>
    <section
      id="catalog-navigation"
      class="catalog-navigation"
      aria-label="Каталог товаров"
      role="dialog"
      [attr.aria-modal]="mobileViewport() ? 'true' : null"
      [appBodyScrollLock]="mobileViewport()"
      bodyScrollLockClass="catalog-mobile-navigation-open"
      [appFocusTrapRestore]="true"
      [trapFocus]="mobileViewport()"
      [initialFocusSelector]="initialFocusSelector()"
      [focusRestoreTarget]="trigger()"
      [appOutsideClick]="!mobileViewport()"
      [outsideClickExclusions]="trigger() ? [trigger()!] : []"
      (outsideClick)="closeRequested.emit()"
      (keydown.escape)="closeFromKeyboard($event)"
    >
      <div class="catalog-navigation__header">
        <div><p>Каталог товаров</p><h2>Выберите категорию</h2></div>
        <button class="close-button" type="button" (click)="closeRequested.emit()" aria-label="Закрыть каталог"><span aria-hidden="true">Esc</span> Закрыть</button>
      </div>
      @if (groupsState().status === 'error') {
        <div class="group-error" role="alert">
          <h3 id="group-error-title" tabindex="-1">Категории временно недоступны</h3>
          <p>Все товары по-прежнему доступны.</p>
          <button type="button" aria-describedby="group-error-title" (click)="retry.emit()">Повторить</button>
        </div>
      }
      <div class="group-list" role="listbox" aria-label="Группы товаров" [appRovingFocus]="true">
        <button
          type="button"
          role="option"
          [attr.aria-selected]="selection().kind === 'all'"
          (click)="selectAll.emit()"
        >
          Все товары
        </button>
        @for (group of groups(); track group.id) {
          <button
            type="button"
            role="option"
            [attr.aria-selected]="isSelected(group)"
            (click)="selectGroup.emit(group)"
          >
            {{ group.name }}
          </button>
        }
      </div>
      <div class="catalog-navigation__footer"><span>↑↓ выбор · Enter применить</span><button type="button" (click)="selectAll.emit()">Все товары</button></div>
    </section>
  `,
})
export class CatalogNavigation {
  readonly groupsState = input.required<GroupsState>();
  readonly groups = input.required<readonly ProductGroup[]>();
  readonly selection = input.required<CatalogSelection>();
  readonly mobileViewport = input.required<boolean>();
  readonly trigger = input<HTMLButtonElement | null>(null);
  readonly closeRequested = output<void>();
  readonly retry = output<void>();
  readonly selectAll = output<void>();
  readonly selectGroup = output<ProductGroup>();

  readonly initialFocusSelector = computed(() =>
    this.groupsState().status === 'error'
      ? '#group-error-title'
      : '[role="option"][aria-selected="true"]',
  );

  protected isSelected(group: ProductGroup): boolean {
    const selection = this.selection();
    return selection.kind === 'group' && selection.group.id === group.id;
  }

  protected closeFromKeyboard(event: Event): void {
    event.preventDefault();
    this.closeRequested.emit();
  }
}
