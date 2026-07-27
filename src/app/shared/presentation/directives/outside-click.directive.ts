import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, effect, inject, input, output } from '@angular/core';

@Directive({
  selector: '[appOutsideClick]',
})
export class OutsideClickDirective {
  readonly appOutsideClick = input(false);
  readonly outsideClickExclusions = input<readonly HTMLElement[]>([]);
  readonly outsideClick = output<PointerEvent>();

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private readonly registration = effect((onCleanup) => {
    if (!this.appOutsideClick()) return;

    const listener = (event: PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Node) || this.host.contains(target)) return;
      if (
        this.outsideClickExclusions().some(
          (element) => element instanceof HTMLElement && element.contains(target),
        )
      ) {
        return;
      }
      this.outsideClick.emit(event);
    };

    this.document.addEventListener('pointerdown', listener);
    onCleanup(() => this.document.removeEventListener('pointerdown', listener));
  });
}
