import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BodyScrollLockDirective } from './body-scroll-lock.directive';
import { FocusTrapRestoreDirective } from './focus-trap-restore.directive';
import { OutsideClickDirective } from './outside-click.directive';
import { RovingFocusDirective } from './roving-focus.directive';

@Component({
  imports: [
    BodyScrollLockDirective,
    FocusTrapRestoreDirective,
    OutsideClickDirective,
    RovingFocusDirective,
  ],
  template: `
    <button class="trigger">Open</button>
    <section
      [appBodyScrollLock]="enabled()"
      [bodyScrollLockClass]="lockClass()"
      [appFocusTrapRestore]="enabled()"
      [initialFocusSelector]="initialSelector()"
      [focusRestoreTarget]="trigger"
      [appOutsideClick]="enabled()"
      [outsideClickExclusions]="exclusions()"
      (outsideClick)="outsideCount.update((count) => count + 1)"
    >
      <button class="first">First</button>
      <div role="listbox" [appRovingFocus]="enabled()">
        <button role="option" aria-selected="false">One</button>
        <button role="option" aria-selected="false">Two</button>
      </div>
      <button class="last">Last</button>
    </section>
  `,
})
class InteractionHost {
  readonly enabled = signal(false);
  readonly initialSelector = signal<string | undefined>(undefined);
  readonly exclusions = signal<readonly HTMLElement[]>([]);
  readonly lockClass = signal('catalog-mobile-navigation-open');
  readonly outsideCount = signal(0);
  trigger!: HTMLButtonElement;
}

describe('shared UI interaction directives', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InteractionHost] });
  });

  it('traps and restores focus only while explicitly enabled', async () => {
    const fixture = TestBed.createComponent(InteractionHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.trigger = fixture.nativeElement.querySelector('.trigger');
    host.trigger.focus();

    host.enabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const first = fixture.nativeElement.querySelector('.first') as HTMLButtonElement;
    const last = fixture.nativeElement.querySelector('.last') as HTMLButtonElement;
    expect(document.activeElement).toBe(first);

    last.focus();
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(document.activeElement).toBe(last);

    host.enabled.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(host.trigger);
  });

  it('uses a usable requested initial target and ignores trapping while disabled', async () => {
    const fixture = TestBed.createComponent(InteractionHost);
    const host = fixture.componentInstance;
    host.trigger = fixture.nativeElement.querySelector('.trigger');
    host.initialSelector.set('[role="option"]:last-child');
    fixture.detectChanges();
    const last = fixture.nativeElement.querySelector('.last') as HTMLButtonElement;
    last.focus();
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(last);

    host.enabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.textContent).toBe('Two');
  });

  it('falls back when the requested initial target is not usable', async () => {
    const fixture = TestBed.createComponent(InteractionHost);
    const host = fixture.componentInstance;
    host.trigger = fixture.nativeElement.querySelector('.trigger');
    host.initialSelector.set('.first');
    (fixture.nativeElement.querySelector('.first') as HTMLButtonElement).disabled = true;
    host.enabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.textContent).toBe('One');
  });

  it('uses the active element as the implicit restore target', async () => {
    const fixture = TestBed.createComponent(InteractionHost);
    const external = document.createElement('button');
    document.body.append(external);
    external.focus();
    fixture.componentInstance.enabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.enabled.set(false);
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(external);
    external.remove();
  });

  it('does not restore focus to a target removed while active', async () => {
    const fixture = TestBed.createComponent(InteractionHost);
    const host = fixture.componentInstance;
    host.trigger = fixture.nativeElement.querySelector('.trigger');
    host.exclusions.set([host.trigger]);
    host.enabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    host.trigger.remove();
    host.enabled.set(false);
    fixture.detectChanges();
    expect(document.activeElement).not.toBe(host.trigger);
  });

  it('does nothing when an enabled focus host has no eligible descendants', () => {
    const fixture = TestBed.createComponent(InteractionHost);
    const host = fixture.componentInstance;
    host.trigger = fixture.nativeElement.querySelector('.trigger');
    fixture.nativeElement.querySelectorAll('section button').forEach((button: HTMLButtonElement) => {
      button.disabled = true;
    });
    host.enabled.set(true);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('section');
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    section.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('moves option focus without changing selection', () => {
    const fixture = TestBed.createComponent(InteractionHost);
    fixture.componentInstance.enabled.set(true);
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement>;
    options[0].focus();

    options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(options[1]);
    options[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(options[0]);
    options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(options[1]);
    options[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(options[0]);
    const ignored = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    options[0].dispatchEvent(ignored);
    expect(ignored.defaultPrevented).toBe(false);
    const middleTab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    options[0].dispatchEvent(middleTab);
    expect(middleTab.defaultPrevented).toBe(false);
    expect(options[0].getAttribute('aria-selected')).toBe('false');
  });

  it('keeps roving focus inert while disabled or without options', () => {
    const fixture = TestBed.createComponent(InteractionHost);
    fixture.detectChanges();
    const list = fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
    const option = list.querySelector('[role="option"]') as HTMLElement;
    option.focus();
    option.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(option);

    fixture.componentInstance.enabled.set(true);
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(option);
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(option);
    list.querySelectorAll('[role="option"]').forEach((element) => element.remove());
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true });
    list.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('emits outside clicks except for the host and explicit exclusions', () => {
    const fixture = TestBed.createComponent(InteractionHost);
    const host = fixture.componentInstance;
    host.trigger = fixture.nativeElement.querySelector('.trigger');
    host.exclusions.set([host.trigger]);
    host.enabled.set(true);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.first').dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    host.trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(host.outsideCount()).toBe(0);

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(host.outsideCount()).toBe(1);
  });

  it('does not register outside-click behavior while disabled', () => {
    const fixture = TestBed.createComponent(InteractionHost);
    fixture.detectChanges();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(fixture.componentInstance.outsideCount()).toBe(0);
  });

  it('removes an active outside-click listener on destroy', () => {
    const fixture = TestBed.createComponent(InteractionHost);
    const host = fixture.componentInstance;
    host.enabled.set(true);
    fixture.detectChanges();
    fixture.destroy();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(host.outsideCount()).toBe(0);
  });

  it('ignores invalid exclusion entries without suppressing an outside click', () => {
    const fixture = TestBed.createComponent(InteractionHost);
    const host = fixture.componentInstance;
    host.trigger = fixture.nativeElement.querySelector('.trigger');
    host.exclusions.set([undefined as unknown as HTMLElement]);
    host.enabled.set(true);
    fixture.detectChanges();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(host.outsideCount()).toBe(1);
  });

  it('reference-counts the body lock and always releases it on destroy', () => {
    const first = TestBed.createComponent(InteractionHost);
    const second = TestBed.createComponent(InteractionHost);
    first.componentInstance.enabled.set(true);
    second.componentInstance.enabled.set(true);
    first.detectChanges();
    second.detectChanges();
    expect(document.body.classList.contains('catalog-mobile-navigation-open')).toBe(true);

    first.destroy();
    expect(document.body.classList.contains('catalog-mobile-navigation-open')).toBe(true);
    second.destroy();
    expect(document.body.classList.contains('catalog-mobile-navigation-open')).toBe(false);
  });

  it('tracks different caller-supplied body lock classes independently', () => {
    const first = TestBed.createComponent(InteractionHost);
    const second = TestBed.createComponent(InteractionHost);
    second.componentInstance.lockClass.set('secondary-scroll-lock');
    first.componentInstance.enabled.set(true);
    second.componentInstance.enabled.set(true);
    first.detectChanges();
    second.detectChanges();
    first.destroy();
    expect(document.body.classList.contains('secondary-scroll-lock')).toBe(true);
    second.destroy();
    expect(document.body.classList.contains('secondary-scroll-lock')).toBe(false);
  });

  it('leaves the body untouched while scroll locking is disabled', () => {
    const fixture = TestBed.createComponent(InteractionHost);
    fixture.detectChanges();
    expect(document.body.classList.contains('catalog-mobile-navigation-open')).toBe(false);
    fixture.destroy();
    expect(document.body.classList.contains('catalog-mobile-navigation-open')).toBe(false);
  });

  it('restores focus when an active focus boundary is destroyed', async () => {
    const fixture = TestBed.createComponent(InteractionHost);
    const host = fixture.componentInstance;
    host.trigger = document.createElement('button');
    document.body.append(host.trigger);
    host.trigger.focus();
    host.enabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.destroy();
    await Promise.resolve();
    expect(document.activeElement).toBe(host.trigger);
    host.trigger.remove();
  });
});
