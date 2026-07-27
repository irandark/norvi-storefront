import { computed, DestroyRef, effect, inject, Injectable, Injector, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type { ProductGroup } from '../../domain/models/product-group';
import { CatalogService } from '../../domain/services/catalog.service';

@Injectable()
export class CatalogPageFacade {
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly canonicalAnnouncementSource = signal('');
  private handledCanonicalization = 0;
  private activated = false;

  readonly groupsState = this.catalog.groupsState;
  readonly productsState = this.catalog.productsState;
  readonly selection = this.catalog.selection;
  readonly groups = this.catalog.groups;
  readonly products = this.catalog.products;
  readonly resultCount = this.catalog.resultCount;
  private readonly productAnnouncement = computed(() => {
    const state = this.catalog.productsState();
    if (state.status === 'loading') {
      return state.mode === 'initial'
        ? 'Загружаем товары'
        : `Обновляем товары: ${this.catalog.selection().name}`;
    }
    return state.status === 'loaded'
      ? `${state.products.length} товаров, ${this.catalog.selection().name}`
      : '';
  });
  readonly liveAnnouncement = computed(
    () => this.canonicalAnnouncementSource() || this.productAnnouncement(),
  );

  activate(): void {
    if (this.activated) return;

    this.activated = true;
    this.handledCanonicalization = this.catalog.canonicalization()?.id ?? 0;
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const values = params.getAll('group');
      if (values.length === 1 && values[0] !== '') this.canonicalAnnouncementSource.set('');
      this.catalog.activateUrlSelection(
        values.length === 1 && values[0] !== '' ? values[0] : values.length ? '' : null,
      );
    });
    this.catalog.activate();

    effect(() => {
      const instruction = this.catalog.canonicalization();
      if (!instruction || instruction.id === this.handledCanonicalization) return;

      this.handledCanonicalization = instruction.id;
      this.canonicalAnnouncementSource.set(instruction.announcement);
      void this.updateGroupQuery(null, true);
    }, { injector: this.injector });
  }

  selectAll(): void {
    this.canonicalAnnouncementSource.set('');
    void this.updateGroupQuery(null, false);
  }

  selectGroup(group: ProductGroup): void {
    this.canonicalAnnouncementSource.set('');
    void this.updateGroupQuery(group.slug, false);
  }

  retryGroups(): void {
    this.catalog.retryGroups();
  }

  retryProducts(): void {
    this.canonicalAnnouncementSource.set('');
    this.catalog.retryProducts();
  }

  private updateGroupQuery(group: string | null, replaceUrl: boolean): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { group },
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
