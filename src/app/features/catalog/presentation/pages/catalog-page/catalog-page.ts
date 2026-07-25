import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  HostListener,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type { ProductGroup } from '../../../domain/models/product-group';
import { CatalogService } from '../../../domain/services/catalog.service';

@Component({
  selector: 'app-catalog-page',
  imports: [],
  templateUrl: './catalog-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  protected readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  protected readonly navigationOpen = signal(false);
  protected readonly liveAnnouncement = signal('');
  protected readonly mobileViewport = signal(false);
  private readonly injector = inject(Injector);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const values = params.getAll('group');
      this.catalog.activateUrlSelection(values.length === 1 && values[0] !== '' ? values[0] : values.length ? '' : null);
    });

    let handledCanonicalization = 0;
    effect(() => {
      const instruction = this.catalog.canonicalization();
      if (!instruction || instruction.id === handledCanonicalization) return;
      handledCanonicalization = instruction.id;
      this.liveAnnouncement.set(instruction.announcement);
      void this.updateGroupQuery(null, true);
    });

    effect(() => {
      const state = this.catalog.productsState();
      if (state.status === 'loading') {
        this.liveAnnouncement.set(
          state.mode === 'initial'
            ? 'Загружаем товары'
            : `Обновляем товары: ${this.catalog.selection().name}`,
        );
      } else if (state.status === 'loaded') {
        this.liveAnnouncement.set(`${state.products.length} товаров, ${this.catalog.selection().name}`);
      }
    });

    effect(() => {
      const open = this.navigationOpen();
      const groupsState = this.catalog.groupsState();
      if (!open || groupsState.status === 'loading') return;
      afterNextRender(() => this.focusNavigationTarget(), { injector: this.injector });
    });

    afterNextRender(() => {
      this.mobileViewport.set(this.isMobileViewport());
    });
  }

  protected toggleNavigation(): void {
    if (this.navigationOpen()) this.closeNavigation();
    else this.openNavigation();
  }

  protected openNavigation(): void {
    this.mobileViewport.set(this.isMobileViewport());
    this.navigationOpen.set(true);
    if (this.isMobileViewport()) {
      this.document.body.classList.add('catalog-mobile-navigation-open');
    }
  }

  protected closeNavigation(restoreFocus = true): void {
    this.navigationOpen.set(false);
    this.document.body.classList.remove('catalog-mobile-navigation-open');
    if (restoreFocus) {
      afterNextRender(() => this.triggerElement()?.focus(), { injector: this.injector });
    }
  }

  protected selectAll(): void {
    void this.updateGroupQuery(null, false);
    this.closeNavigation();
  }

  protected selectGroup(group: ProductGroup): void {
    void this.updateGroupQuery(group.slug, false);
    this.closeNavigation();
  }

  protected showAllProducts(): void {
    void this.updateGroupQuery(null, false);
  }

  protected isSelected(group: ProductGroup): boolean {
    const selection = this.catalog.selection();
    return selection.kind === 'group' && selection.group.id === group.id;
  }

  protected loadingLabel(): string {
    const state = this.catalog.productsState();
    return state.status === 'loading' && state.mode === 'refetch'
      ? 'Обновляем товары'
      : 'Загружаем товары';
  }

  protected onOptionKeydown(event: KeyboardEvent): void {
    const options = this.getOptions();
    const current = options.indexOf(event.currentTarget as HTMLElement);
    let next: number;
    if (event.key === 'ArrowDown') next = Math.min(current + 1, options.length - 1);
    else if (event.key === 'ArrowUp') next = Math.max(current - 1, 0);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else return;
    event.preventDefault();
    options[next]?.focus();
  }

  protected onNavigationKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeNavigation();
      return;
    }
    if (!this.isMobileViewport() || event.key !== 'Tab') return;
    const focusable = this.getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!this.navigationOpen() || this.isMobileViewport()) return;
    const target = event.target as Node;
    if (!this.navigationElement()?.contains(target) && !this.triggerElement()?.contains(target)) {
      this.closeNavigation();
    }
  }

  protected formatPrice(priceInCents: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(priceInCents / 100);
  }

  private updateGroupQuery(group: string | null, replaceUrl: boolean): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { group },
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  private focusNavigationTarget(): void {
    if (this.catalog.groupsState().status === 'error') {
      this.navigationElement()?.querySelector<HTMLElement>('#group-error-title')?.focus();
      return;
    }
    const selected = this.navigationElement()?.querySelector<HTMLElement>(
      '[role="option"][aria-selected="true"]',
    );
    (selected ?? this.getOptions()[0])?.focus();
  }

  private getOptions(): HTMLElement[] {
    return Array.from(
      this.navigationElement()?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
    );
  }

  private getFocusable(): HTMLElement[] {
    return Array.from(
      this.navigationElement()?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex="0"]',
      ) ?? [],
    );
  }

  private isMobileViewport(): boolean {
    return typeof matchMedia === 'function' && matchMedia('(max-width: 700px)').matches;
  }

  private triggerElement(): HTMLButtonElement | null {
    return this.document.querySelector<HTMLButtonElement>('.catalog-trigger');
  }

  private navigationElement(): HTMLElement | null {
    return this.document.querySelector<HTMLElement>('.catalog-navigation');
  }
}
