import { expect, test } from '@playwright/test';

const products = [
  {
    id: 'linen-tote',
    name: 'Льняная сумка',
    description: 'Лёгкая сумка для города',
    priceInCents: 349000,
    imageUrl: '/images/product-placeholder.svg',
    stock: 0,
  },
  {
    id: 'ceramic-cup',
    name: 'Керамическая чашка',
    description: 'Чашка ручной работы',
    priceInCents: 219000,
    imageUrl: '/images/product-placeholder.svg',
    stock: 4,
  },
];

test('renders products returned by the catalog endpoint', async ({ page }) => {
  await page.route('**/data/products.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', json: products }),
  );

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Каталог', exact: true })).toBeVisible();
  await expect(page.getByTestId('product-card')).toHaveCount(2);
  await expect(page.getByRole('img', { name: 'Льняная сумка' })).toBeVisible();
  await expect(page.getByText('Нет в наличии')).toBeVisible();
  await expect(page.getByText(/3\s490\s₽/)).toBeVisible();
});

test('shows loading while the catalog request is unresolved', async ({ page }) => {
  await page.route('**/data/products.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ status: 200, contentType: 'application/json', json: products });
  });

  await page.goto('/');

  await expect(page.getByRole('status')).toContainText('Загружаем товары');
  await expect(page.getByTestId('product-card')).toHaveCount(2);
});

test('shows the empty catalog state', async ({ page }) => {
  await page.route('**/data/products.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', json: [] }),
  );

  await page.goto('/');

  await expect(page.getByTestId('catalog-empty')).toContainText('Каталог пока пуст');
  await expect(page.getByTestId('product-card')).toHaveCount(0);
});

test('recovers when retry succeeds after a failed request', async ({ page }) => {
  let requestCount = 0;
  await page.route('**/data/products.json', (route) => {
    requestCount += 1;
    return requestCount === 1
      ? route.fulfill({ status: 500, body: 'private server detail' })
      : route.fulfill({ status: 200, contentType: 'application/json', json: products });
  });

  await page.goto('/');

  await expect(page.getByRole('alert')).toContainText('Не удалось загрузить товары');
  await expect(page.getByText('private server detail')).toHaveCount(0);
  await page.getByRole('button', { name: 'Попробовать снова' }).click();

  await expect(page.getByTestId('product-card')).toHaveCount(2);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('fits the catalog into a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/data/products.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', json: products }),
  );

  await page.goto('/');
  await expect(page.getByTestId('product-card')).toHaveCount(2);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
