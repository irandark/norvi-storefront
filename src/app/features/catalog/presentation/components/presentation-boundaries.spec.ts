import { TestBed } from '@angular/core/testing';
import type { Product } from '../../../products/domain';
import type { ProductGroup } from '../../domain/models/product-group';
import { CatalogHeader } from './catalog-header/catalog-header';
import { CatalogNavigation } from './catalog-navigation/catalog-navigation';
import { CatalogResults } from './catalog-results/catalog-results';
import { ProductCard } from './product-card/product-card';
import { RubPricePipe } from '../pipes/rub-price.pipe';

describe('catalog presentational boundaries', () => {
  const group: ProductGroup = { id: 'home', slug: 'home', name: 'Home' };
  const product: Product = {
    id: 'lamp',
    name: 'Lamp',
    description: 'Light',
    priceInCents: 349000,
    imageUrl: '/lamp.svg',
    stock: 2,
  };

  it('emits the header trigger without owning navigation state', () => {
    const fixture = TestBed.createComponent(CatalogHeader);
    fixture.componentRef.setInput('navigationOpen', false);
    fixture.componentRef.setInput('mobileViewport', false);
    const emitted = vi.fn();
    fixture.componentInstance.toggleRequested.subscribe(emitted);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.catalog-trigger').click();
    expect(emitted).toHaveBeenCalledOnce();
  });

  it('renders navigation inputs and emits group intent', () => {
    const fixture = TestBed.createComponent(CatalogNavigation);
    fixture.componentRef.setInput('groupsState', { status: 'loaded', groups: [group] });
    fixture.componentRef.setInput('groups', [group]);
    fixture.componentRef.setInput('selection', { kind: 'all', name: 'Все товары' });
    fixture.componentRef.setInput('mobileViewport', false);
    const emitted = vi.fn();
    fixture.componentInstance.selectGroup.subscribe(emitted);
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('[role="option"]')[1].click();
    expect(emitted).toHaveBeenCalledWith(group);
  });

  it('renders results and product cards through input-only state', () => {
    const fixture = TestBed.createComponent(CatalogResults);
    fixture.componentRef.setInput('state', { status: 'loaded', products: [product] });
    fixture.componentRef.setInput('selection', { kind: 'all', name: 'Все товары' });
    fixture.componentRef.setInput('products', [product]);
    fixture.componentRef.setInput('resultCount', 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-product-card')).toHaveLength(1);

    const card = TestBed.createComponent(ProductCard);
    card.componentRef.setInput('product', product);
    card.detectChanges();
    expect(card.nativeElement.textContent).toContain('В наличии · 2 шт.');
  });

  it('formats integer minor units as RUB', () => {
    expect(new RubPricePipe().transform(349000)).toContain('3 490');
  });
});
