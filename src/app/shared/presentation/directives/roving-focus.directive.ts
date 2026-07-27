import { Directive, ElementRef, inject, input } from '@angular/core';

const OPTION_SELECTOR = '[role="option"]:not([disabled])';

@Directive({
  selector: '[appRovingFocus]',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class RovingFocusDirective {
  readonly appRovingFocus = input(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.appRovingFocus()) return;

    const options = Array.from(this.host.querySelectorAll<HTMLElement>(OPTION_SELECTOR));
    if (options.length === 0) return;

    const current = options.indexOf(event.target as HTMLElement);
    let next: number;
    if (event.key === 'ArrowDown') next = Math.min(Math.max(current, 0) + 1, options.length - 1);
    else if (event.key === 'ArrowUp') next = Math.max(current < 0 ? 0 : current - 1, 0);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else return;

    event.preventDefault();
    options[next]?.focus();
  }
}
