import { parseProductDtos } from './parse-product-dtos';

const validDto = {
  id: 'tote',
  name: 'Сумка',
  description: 'Льняная',
  priceInCents: 10000,
  imageUrl: '/image.svg',
  stock: 2,
};

describe('parseProductDtos', () => {
  it('accepts a valid backend DTO', () => {
    expect(parseProductDtos([validDto])).toEqual([validDto]);
  });

  it.each([undefined, null, {}, 'products'])('rejects a non-array response', (value) => {
    expect(() => parseProductDtos(value)).toThrow('Catalog response must be an array');
  });

  it.each([null, 'product', [], 42])('rejects a product that is not an object', (value) => {
    expect(() => parseProductDtos([value])).toThrow('Product at index 0 must be an object');
  });

  it.each(['id', 'name', 'description', 'imageUrl'] as const)(
    'rejects an invalid %s',
    (field) => {
      expect(() => parseProductDtos([{ ...validDto, [field]: '   ' }])).toThrow(
        `invalid ${field}`,
      );
      expect(() => parseProductDtos([{ ...validDto, [field]: 42 }])).toThrow(`invalid ${field}`);
    },
  );

  it.each([
    { ...validDto, priceInCents: -1 },
    { ...validDto, priceInCents: 1.5 },
    { ...validDto, priceInCents: undefined },
  ])('rejects an invalid price', (dto) => {
    expect(() => parseProductDtos([dto])).toThrow(/priceInCents/);
  });

  it.each([
    { ...validDto, stock: -1 },
    { ...validDto, stock: 1.5 },
  ])('rejects invalid stock', (dto) => {
    expect(() => parseProductDtos([dto])).toThrow(/stock/);
  });
});
