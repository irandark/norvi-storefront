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
  templateUrl: './catalog-navigation.html',
  styleUrl: './catalog-navigation.css',
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
