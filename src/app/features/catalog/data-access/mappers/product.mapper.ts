import type { ProductDto } from '../dto/product.dto';
import type { Product } from '../../domain/models/product';

export function mapProductDto(dto: ProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    priceInCents: dto.priceInCents,
    imageUrl: dto.imageUrl,
    stock: dto.stock,
  };
}
