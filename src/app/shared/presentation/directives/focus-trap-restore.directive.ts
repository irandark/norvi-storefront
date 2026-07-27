import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

@Directive({
  selector: '[appFocusTrapRestore]',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class FocusTrapRestoreDirective {
  readonly appFocusTrapRestore = input(false);
  readonly trapFocus = input(true);
  readonly initialFocusSelector = input<string>();
  readonly focusRestoreTarget = input<HTMLElement | null>(null);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  private readonly focusLifecycle = effect((onCleanup) => {
    if (!this.appFocusTrapRestore()) return;

    const restoreTarget = this.focusRestoreTarget() ?? this.activeElement();
    afterNextRender(() => this.initialTarget()?.focus(), { injector: this.injector });

    onCleanup(() => {
      if (restoreTarget?.isConnected) {
        queueMicrotask(() => {
          if (restoreTarget.isConnected) restoreTarget.focus();
        });
      }
    });
  });

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.appFocusTrapRestore() || !this.trapFocus() || event.key !== 'Tab') return;

    const focusable = this.focusableElements();
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

  private activeElement(): HTMLElement | null {
    return this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
  }

  private initialTarget(): HTMLElement | null {
    const requested = this.initialFocusSelector();
    if (requested) {
      const match = this.host.querySelector<HTMLElement>(requested);
      if (match && this.isUsable(match)) return match;
    }
    return this.focusableElements()[0] ?? null;
  }

  private focusableElements(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) =>
      this.isUsable(element),
    );
  }

  private isUsable(element: HTMLElement): boolean {
    return element.isConnected && !element.hasAttribute('disabled') && !element.hidden;
  }
}
