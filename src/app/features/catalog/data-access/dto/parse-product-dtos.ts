import type { ProductDto } from './product.dto';

export function parseProductDtos(value: unknown): readonly ProductDto[] {
  if (!Array.isArray(value)) {
    throw new Error('Catalog response must be an array');
  }

  return value.map(parseProduct);
}

function parseProduct(value: unknown, index: number): ProductDto {
  if (!isRecord(value)) {
    throw new Error(`Product at index ${index} must be an object`);
  }

  return {
    id: readNonEmptyString(value, 'id', index),
    name: readNonEmptyString(value, 'name', index),
    description: readNonEmptyString(value, 'description', index),
    priceInCents: readInteger(value, 'priceInCents', index, 1),
    imageUrl: readNonEmptyString(value, 'imageUrl', index),
    stock: readInteger(value, 'stock', index, 0),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNonEmptyString(value: Record<string, unknown>, field: string, index: number): string {
  const candidate = value[field];

  if (typeof candidate !== 'string' || candidate.trim().length === 0) {
    throw new Error(`Product at index ${index} has invalid ${field}`);
  }

  return candidate;
}

function readInteger(
  value: Record<string, unknown>,
  field: string,
  index: number,
  minimum: number,
): number {
  const candidate = value[field];

  if (!Number.isInteger(candidate) || (candidate as number) < minimum) {
    throw new Error(`Product at index ${index} has invalid ${field}`);
  }

  return candidate as number;
}
