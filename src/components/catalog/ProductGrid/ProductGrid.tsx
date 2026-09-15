import type { Product } from '../../../types/product'
import type { Category } from '../../../types/category'
import ProductCard from '../ProductCard/ProductCard'
export default function ProductGrid({
  products,
  categories,
  onSelect,
}: {
  products: Product[]
  categories: Category[]
  onSelect: (p: Product) => void
}) {
  return (
    <div className="product-grid animate-in">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          category={categories.find((c) => c.id === p.category_id)?.name || ''}
          onOpen={() => onSelect(p)}
        />
      ))}
    </div>
  )
}
