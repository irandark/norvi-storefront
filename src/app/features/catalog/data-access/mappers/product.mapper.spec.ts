import type { ProductDto } from '../dto/product.dto';
import { mapProductDto } from './product.mapper';

it('maps a backend DTO to a distinct domain product', () => {
  const dto: ProductDto = {
    id: 'tote',
    name: 'Сумка',
    description: 'Льняная',
    priceInCents: 10000,
    imageUrl: '/image.svg',
    stock: 2,
  };

  const product = mapProductDto(dto);

  expect(product).toEqual(dto);
  expect(product).not.toBe(dto);
});
