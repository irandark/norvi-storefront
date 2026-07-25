import type { ProductGroup } from '../../domain/models/product-group';
import type { ProductGroupDto } from '../dto/product-group.dto';

export function mapProductGroupDto(dto: ProductGroupDto): ProductGroup {
  return { id: dto.id, slug: dto.slug, name: dto.name };
}
