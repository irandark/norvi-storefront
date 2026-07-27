import { DOCUMENT } from '@angular/common';
import { Directive, effect, inject, input } from '@angular/core';

const lockCounts = new WeakMap<HTMLElement, Map<string, number>>();

@Directive({
  selector: '[appBodyScrollLock]',
})
export class BodyScrollLockDirective {
  readonly appBodyScrollLock = input(false);
  readonly bodyScrollLockClass = input.required<string>();

  private readonly body = inject(DOCUMENT).body;

  private readonly lock = effect((onCleanup) => {
    if (!this.appBodyScrollLock()) return;

    const lockClass = this.bodyScrollLockClass();
    const bodyLocks = lockCounts.get(this.body) ?? new Map<string, number>();
    const count = bodyLocks.get(lockClass) ?? 0;
    bodyLocks.set(lockClass, count + 1);
    lockCounts.set(this.body, bodyLocks);
    if (count === 0) this.body.classList.add(lockClass);

    onCleanup(() => {
      const currentBodyLocks = lockCounts.get(this.body);
      const next = Math.max((currentBodyLocks?.get(lockClass) ?? 1) - 1, 0);
      if (next === 0) {
        currentBodyLocks?.delete(lockClass);
        this.body.classList.remove(lockClass);
        if (currentBodyLocks?.size === 0) lockCounts.delete(this.body);
      } else {
        currentBodyLocks?.set(lockClass, next);
      }
    });
  });
}
