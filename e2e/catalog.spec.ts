import { expect, test, type Page, type Route } from '@playwright/test';

const groups = [
  { id: 'kitchen & home', slug: 'kuhnya', name: 'Кухня и дом' },
  { id: 'media', slug: 'media', name: 'Медиа' },
] as const;

const products = [
  {
    id: 'kettle',
    name: 'Чайник',
    description: 'Тихий чайник',
    priceInCents: 849000,
    imageUrl: '/images/product-placeholder.svg',
    stock: 4,
  },
] as const;

async function fulfillJson(route: Route, json: unknown): Promise<void> {
  await route.fulfill({ status: 200, contentType: 'application/json', json });
}

async function installApi(
  page: Page,
  options: {
    productResponse?: readonly unknown[];
    onProducts?: (route: Route) => Promise<void>;
    onGroups?: (route: Route) => Promise<void>;
  } = {},
): Promise<void> {
  await page.route('**/api/product-groups', (route) =>
    options.onGroups ? options.onGroups(route) : fulfillJson(route, groups),
  );
  await page.route('**/api/products**', (route) =>
    options.onProducts
      ? options.onProducts(route)
      : fulfillJson(route, options.productResponse ?? products),
  );
}

test('uses observable API responses, backend order, and exact encoded group id', async ({ page }) => {
  const productUrls: string[] = [];
  await installApi(page, {
    onProducts: async (route) => {
      productUrls.push(route.request().url());
      await fulfillJson(route, products);
    },
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Каталог товаров' }).click();
  const options = page.getByRole('option');
  await expect(options).toHaveText(['Все товары', 'Кухня и дом', 'Медиа']);
  await options.filter({ hasText: 'Кухня и дом' }).click();

  await expect(page).toHaveURL(/\?group=kuhnya$/);
  await expect(page.getByRole('heading', { name: 'Кухня и дом', level: 1 })).toBeVisible();
  await expect(page.getByTestId('product-card')).toHaveCount(1);
  expect(productUrls.some((url) => url.endsWith('/api/products?groupId=kitchen%20%26%20home'))).toBe(
    true,
  );
});

test('preserves unrelated query parameters and restores selection with back and forward', async ({
  page,
}) => {
  await installApi(page);
  await page.goto('/?campaign=spring');

  await page.getByRole('button', { name: 'Каталог товаров' }).click();
  await page.getByRole('option', { name: /Кухня и дом/ }).click();
  await expect(page).toHaveURL('/?campaign=spring&group=kuhnya');
  await expect(page.getByRole('heading', { name: 'Кухня и дом', level: 1 })).toBeVisible();

  await page.getByRole('button', { name: 'Каталог товаров' }).click();
  await page.getByRole('option', { name: /Медиа/ }).click();
  await expect(page).toHaveURL('/?campaign=spring&group=media');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Кухня и дом', level: 1 })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Медиа', level: 1 })).toBeVisible();
});

test('canonicalizes an unknown slug by replacement without losing other query parameters', async ({
  page,
}) => {
  await installApi(page);
  await page.goto('/?campaign=spring&group=removed');
  await expect(page).toHaveURL('/?campaign=spring');
  await expect(page.getByRole('heading', { name: 'Все товары', level: 1 })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL('about:blank');
});

test('makes the newest group authoritative when an older request resolves last', async ({ page }) => {
  const pending = new Map<string, Route>();
  await installApi(page, {
    onProducts: async (route) => {
      const groupId = new URL(route.request().url()).searchParams.get('groupId') ?? 'all';
      if (groupId === 'all') {
        await fulfillJson(route, products);
      } else {
        pending.set(groupId, route);
      }
    },
  });
  await page.goto('/');

  await page.getByRole('button', { name: 'Каталог товаров' }).click();
  await page.getByRole('option', { name: /Кухня и дом/ }).click();
  await page.getByRole('button', { name: 'Каталог товаров' }).click();
  await page.getByRole('option', { name: /Медиа/ }).click();
  await expect.poll(() => pending.size).toBe(2);

  await fulfillJson(pending.get('media')!, [{ ...products[0], id: 'new', name: 'Новый результат' }]);
  await fulfillJson(pending.get('kitchen & home')!, [
    { ...products[0], id: 'old', name: 'Устаревший результат' },
  ]);
  await expect(page.getByRole('heading', { name: 'Медиа', level: 1 })).toBeVisible();
  await expect(page.getByText('Новый результат')).toBeVisible();
  await expect(page.getByText('Устаревший результат')).toHaveCount(0);
});

test('keeps all products usable when groups fail and retries only groups', async ({ page }) => {
  let groupRequests = 0;
  await installApi(page, {
    onGroups: async (route) => {
      groupRequests += 1;
      if (groupRequests === 1) await route.fulfill({ status: 503, body: 'private group detail' });
      else await fulfillJson(route, groups);
    },
  });
  await page.goto('/');
  await expect(page.getByTestId('product-card')).toHaveCount(1);

  await page.getByRole('button', { name: 'Каталог товаров' }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Категории временно недоступны');
  await expect(page.getByText('private group detail')).toHaveCount(0);
  await alert.getByRole('button', { name: 'Повторить' }).click();
  await expect(page.getByRole('option', { name: /Кухня и дом/ })).toBeVisible();
  expect(groupRequests).toBe(2);
});

test('shows product failure and retry for the current canonical selection', async ({ page }) => {
  let selectedRequests = 0;
  await installApi(page, {
    onProducts: async (route) => {
      const selected = new URL(route.request().url()).searchParams.has('groupId');
      if (!selected) return fulfillJson(route, products);
      selectedRequests += 1;
      if (selectedRequests === 1) await route.fulfill({ status: 500, body: 'private product detail' });
      else await fulfillJson(route, products);
    },
  });
  await page.goto('/?group=kuhnya');

  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Не удалось загрузить товары');
  await expect(page.getByText('private product detail')).toHaveCount(0);
  await alert.getByRole('button', { name: 'Повторить загрузку' }).click();
  await expect(page.getByTestId('product-card')).toHaveCount(1);
  expect(selectedRequests).toBe(2);
});

test('renders selected-group empty state and returns to all products', async ({ page }) => {
  await installApi(page, { productResponse: [] });
  await page.goto('/?group=kuhnya');
  await expect(page.getByTestId('catalog-empty')).toContainText(
    'В этой категории пока нет товаров',
  );
  await expect(page.getByText('0 товаров')).toBeVisible();
  await page.getByRole('button', { name: 'Показать все товары' }).click();
  await expect(page).toHaveURL('/');
});

test('implements desktop and mobile close, focus, modal, and responsive contracts', async ({
  page,
}) => {
  await installApi(page);
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Каталог товаров' });
  await trigger.click();
  await expect(page.getByRole('option', { name: /Все товары/ })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('option', { name: /Медиа/ })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();

  await page.setViewportSize({ width: 375, height: 812 });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Каталог товаров' });
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await expect(page.getByRole('option', { name: /Все товары/ })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Закрыть каталог' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('option', { name: /Все товары/ })).toBeFocused();
  await page.getByRole('button', { name: 'Закрыть каталог' }).first().click();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('treats invalid external data as scoped controlled failures', async ({ page }) => {
  await page.route('**/api/product-groups', (route) =>
    fulfillJson(route, [
      { id: 'duplicate', slug: 'one', name: 'One' },
      { id: 'duplicate', slug: 'two', name: 'Two' },
    ]),
  );
  await page.route('**/api/products**', (route) =>
    fulfillJson(route, [{ ...products[0], priceInCents: 0 }]),
  );
  await page.goto('/');

  await expect(page.getByRole('alert')).toContainText('Не удалось загрузить товары');
  const trigger = page.getByRole('button', { name: 'Каталог товаров' });
  await trigger.click();
  await expect(page.getByText('Категории временно недоступны')).toBeFocused();
  await expect(page.getByRole('option')).toHaveText(['Все товары']);
});

test('closes through desktop outside click and mobile backdrop while locking page scroll', async ({
  page,
}) => {
  await installApi(page);
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Каталог товаров' });

  await trigger.click();
  await page.locator('.navigation-backdrop').click({ position: { x: 4, y: 400 } });
  await expect(page.getByRole('dialog', { name: 'Каталог товаров' })).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Каталог товаров' })).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.setViewportSize({ width: 375, height: 812 });
  await trigger.click();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(page.locator('.site-header')).toHaveAttribute('inert', '');
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.locator('.navigation-backdrop').click({ position: { x: 1, y: 1 } });
  await expect(page.getByRole('dialog', { name: 'Каталог товаров' })).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(trigger).toBeFocused();
});

test('wraps an unusually long backend group label without mobile overflow or clipping', async ({
  page,
}) => {
  const longName =
    'Профессиональное оборудование для приготовления напитков и домашней выпечки';
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/api/product-groups', (route) =>
    fulfillJson(route, [{ id: 'long-group', slug: 'long-group', name: longName }]),
  );
  await page.route('**/api/products**', (route) => fulfillJson(route, products));

  await page.goto('/');
  await page.getByRole('button', { name: 'Каталог товаров' }).click();
  const option = page.getByRole('option', { name: longName });
  await expect(option).toBeVisible();

  const geometry = await option.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
    const range = document.createRange();
    if (textNode) range.selectNodeContents(textNode);
    return {
      height: box.height,
      textLines: textNode ? range.getClientRects().length : 0,
      clipped: element.scrollWidth > element.clientWidth,
      pageOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  expect(geometry.height).toBeGreaterThanOrEqual(44);
  expect(geometry.textLines).toBeGreaterThan(1);
  expect(geometry.clipped).toBe(false);
  expect(geometry.pageOverflow).toBe(false);
});
