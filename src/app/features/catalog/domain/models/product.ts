export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priceInCents: number;
  readonly imageUrl: string;
  readonly stock: number;
}
