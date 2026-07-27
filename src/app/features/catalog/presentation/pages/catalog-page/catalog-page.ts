import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CatalogHeader } from '../../components/catalog-header/catalog-header';
import { CatalogNavigation } from '../../components/catalog-navigation/catalog-navigation';
import { CatalogResults } from '../../components/catalog-results/catalog-results';
import { CatalogPageFacade } from '../../facades/catalog-page.facade';

@Component({
  selector: 'app-catalog-page',
  imports: [CatalogHeader, CatalogNavigation, CatalogResults],
  providers: [CatalogPageFacade],
  templateUrl: './catalog-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage implements OnInit {
  protected readonly facade = inject(CatalogPageFacade);
  protected readonly navigationOpen = signal(false);
  protected readonly mobileViewport = signal(false);
  protected readonly trigger = signal<HTMLButtonElement | null>(null);

  ngOnInit(): void {
    this.mobileViewport.set(this.isMobileViewport());
    this.facade.activate();
  }

  protected toggleNavigation(target: EventTarget | null): void {
    if (target instanceof HTMLButtonElement) this.trigger.set(target);
    this.mobileViewport.set(this.isMobileViewport());
    this.navigationOpen.update((open) => !open);
  }

  protected closeNavigation(): void {
    this.navigationOpen.set(false);
  }

  protected selectAll(): void {
    this.facade.selectAll();
    this.closeNavigation();
  }

  protected isMobileViewport(): boolean {
    return typeof matchMedia === 'function' && matchMedia('(max-width: 700px)').matches;
  }
}
