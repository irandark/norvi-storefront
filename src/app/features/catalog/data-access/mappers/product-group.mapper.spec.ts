import { mapProductGroupDto } from './product-group.mapper';

it('maps a product-group DTO to a distinct domain model', () => {
  const dto = { id: 'home', slug: 'home', name: 'Дом' };
  expect(mapProductGroupDto(dto)).toEqual(dto);
  expect(mapProductGroupDto(dto)).not.toBe(dto);
});
