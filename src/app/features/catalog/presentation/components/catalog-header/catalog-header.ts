import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-catalog-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-header.html',
  styleUrl: './catalog-header.css',
})
export class CatalogHeader {
  readonly navigationOpen = input.required<boolean>();
  readonly mobileViewport = input.required<boolean>();
  readonly toggleRequested = output<EventTarget | null>();
}
