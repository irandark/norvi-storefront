import { parseProductGroupDtos } from './parse-product-group-dtos';

const valid = { id: 'home', slug: 'dlya-doma', name: 'Для дома' };

describe('parseProductGroupDtos', () => {
  it('accepts ordered valid groups', () => expect(parseProductGroupDtos([valid])).toEqual([valid]));
  it.each([null, {}, 'groups'])('rejects a non-array', (value) =>
    expect(() => parseProductGroupDtos(value)).toThrow('must be an array'));
  it.each([null, [], 'group'])('rejects a non-object group', (value) =>
    expect(() => parseProductGroupDtos([value])).toThrow('must be an object'));
  it.each(['id', 'slug', 'name'] as const)('rejects invalid %s', (field) => {
    expect(() => parseProductGroupDtos([{ ...valid, [field]: ' ' }])).toThrow(`invalid ${field}`);
    expect(() => parseProductGroupDtos([{ ...valid, [field]: 3 }])).toThrow(`invalid ${field}`);
  });
  it.each(['UPPER', '-leading', 'two--hyphens', 'кириллица'])('rejects malformed slug %s', (slug) =>
    expect(() => parseProductGroupDtos([{ ...valid, slug }])).toThrow('invalid slug'));
  it('rejects duplicate ids', () =>
    expect(() => parseProductGroupDtos([valid, { ...valid, slug: 'other' }])).toThrow('Duplicate product group id'));
  it('rejects duplicate slugs', () =>
    expect(() => parseProductGroupDtos([valid, { ...valid, id: 'other' }])).toThrow('Duplicate product group slug'));
});
