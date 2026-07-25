import type { ProductGroupDto } from './product-group.dto';

const canonicalSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseProductGroupDtos(value: unknown): readonly ProductGroupDto[] {
  if (!Array.isArray(value)) throw new Error('Product groups response must be an array');

  const ids = new Set<string>();
  const slugs = new Set<string>();
  return value.map((candidate, index) => {
    if (!isRecord(candidate)) throw new Error(`Product group at index ${index} must be an object`);
    const dto = {
      id: readString(candidate, 'id', index),
      slug: readString(candidate, 'slug', index),
      name: readString(candidate, 'name', index),
    };
    if (!canonicalSlug.test(dto.slug)) throw new Error(`Product group at index ${index} has invalid slug`);
    if (ids.has(dto.id)) throw new Error(`Duplicate product group id: ${dto.id}`);
    if (slugs.has(dto.slug)) throw new Error(`Duplicate product group slug: ${dto.slug}`);
    ids.add(dto.id);
    slugs.add(dto.slug);
    return dto;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: Record<string, unknown>, field: string, index: number): string {
  const candidate = value[field];
  if (typeof candidate !== 'string' || candidate.trim().length === 0) {
    throw new Error(`Product group at index ${index} has invalid ${field}`);
  }
  return candidate;
}
