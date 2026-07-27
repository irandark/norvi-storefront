import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpProductGroupRepository } from './features/catalog/data-access/repositories/http-product-group.repository';
import { ProductGroupHttpService } from './features/catalog/data-access/transport/product-group-http.service';
import { ProductGroupRepository } from './features/catalog/domain';
import { CatalogService } from './features/catalog/domain/services/catalog.service';
import { HttpProductRepository } from './features/products/data-access/repositories/http-product.repository';
import { ProductHttpService } from './features/products/data-access/transport/product-http.service';
import { ProductRepository } from './features/products/domain';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    ProductGroupHttpService,
    ProductHttpService,
    CatalogService,
    { provide: ProductGroupRepository, useClass: HttpProductGroupRepository },
    { provide: ProductRepository, useClass: HttpProductRepository },
  ],
};
