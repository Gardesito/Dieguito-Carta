import { ArrowUpRight, Star } from 'lucide-react'
import type { Product } from '../../../types/product'
import FoodImage from '../../common/FoodImage'
import { currency } from '../../../utils/currency'
import { priceOptions } from '../../../utils/products'
export default function ProductCard({
  product: p,
  category,
  onOpen,
}: {
  product: Product
  category: string
  onOpen: () => void
}) {
  const options = priceOptions(p)
  return (
    <button
      className={`product-card ${!p.is_available ? 'sold-out' : ''}`}
      onClick={onOpen}
      aria-label={`Ver ${p.name}, ${p.is_available ? 'disponible' : 'agotado'}`}
    >
      <div className="product-photo">
        <FoodImage src={p.image_url} alt={p.image_alt || p.name} />
        {p.is_featured && (
          <span className="featured">
            <Star size={12} fill="currentColor" /> Favorito
          </span>
        )}
        <span className={`availability ${!p.is_available ? 'unavailable' : ''}`}>
          {p.is_available ? 'Disponible' : 'Agotado'}
        </span>
      </div>
      <div className="product-info">
        <span className="product-category">{category}</span>
        <h3>{p.name}</h3>
        <p>{p.description}</p>
        <div className="product-bottom">
          <div>
            {options.length ? (
              options.slice(0, 2).map((o) => (
                <div className="price-option" key={o.id}>
                  <small>{o.name}</small>
                  <strong>
                    {o.price === null ? p.price_label || 'Consultar' : currency(o.price)}
                  </strong>
                </div>
              ))
            ) : (
              <strong className="price">
                {p.price === null ? p.price_label || 'Consultar' : currency(p.price)}{' '}
                <small>
                  {p.price !== null && !p.price_label.startsWith('Consultar') ? p.price_label : ''}
                </small>
              </strong>
            )}
          </div>
          <span className="card-arrow" aria-hidden="true">
            <ArrowUpRight size={23} />
          </span>
        </div>
      </div>
    </button>
  )
}
