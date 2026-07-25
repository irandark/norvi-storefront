import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpProductCatalogRepository } from './features/catalog/data-access/repositories/http-product-catalog.repository';
import { CatalogHttpService } from './features/catalog/data-access/transport/catalog-http.service';
import { ProductCatalogRepository } from './features/catalog/domain/ports/product-catalog.repository';
import { CatalogService } from './features/catalog/domain/services/catalog.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    CatalogHttpService,
    CatalogService,
    { provide: ProductCatalogRepository, useClass: HttpProductCatalogRepository },
  ],
};
