import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import type { Product } from '../../../types/product'
import Modal from '../../common/Modal/Modal'
import FoodImage from '../../common/FoodImage'
import { canOrder, priceOptions, selectedPrice } from '../../../utils/products'
import { currency } from '../../../utils/currency'
import { productMessage, tableFromSearch } from '../../../utils/whatsapp'
import { openWhatsApp } from '../../../services/whatsapp.service'
export default function ProductModal({
  product: p,
  category,
  phone,
  onClose,
}: {
  product: Product
  category: string
  phone: string
  onClose: () => void
}) {
  const [option, setOption] = useState('')
  const options = priceOptions(p)
  const addons = p.product_variants.filter((v) => v.is_addon)
  const price = selectedPrice(p, option)
  return (
    <Modal onClose={onClose} titleId="product-title" className="product-modal">
      <FoodImage src={p.image_url} alt={p.image_alt || p.name} priority />
      <div className="modal-body">
        <p className="eyebrow primary">{category}</p>
        <h2 id="product-title">{p.name}</h2>
        <p className="muted">{p.description}</p>
        {p.ingredients && p.ingredients !== p.description && (
          <p>
            <strong>Ingredientes: </strong>
            {p.ingredients}
          </p>
        )}
        {options.length > 0 && (
          <fieldset className="variant-picker">
            <legend>Elegí una opción para pedir</legend>
            {options.map((v) => (
              <label key={v.id} className={option === v.id ? 'selected' : ''}>
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={option === v.id}
                  disabled={!v.available}
                  onChange={() => setOption(v.id)}
                />
                <span>
                  {v.name}
                  {!v.available ? ' · Agotado' : ''}
                </span>
                <strong>
                  {v.price === null ? p.price_label || 'Consultar' : currency(v.price)}
                </strong>
              </label>
            ))}
          </fieldset>
        )}
        {addons.length > 0 && (
          <fieldset className="variant-picker">
            <legend>Salsa (opcional)</legend>
            <label>
              <input type="radio" name="sauce" checked={!option} onChange={() => setOption('')} />
              Sin adicional
            </label>
            {addons.map((v) => (
              <label key={v.id} className={option === v.id ? 'selected' : ''}>
                <input
                  type="radio"
                  name="sauce"
                  checked={option === v.id}
                  disabled={!v.is_available}
                  onChange={() => setOption(v.id)}
                />
                <span>
                  {v.name}
                  {!v.is_available ? ' · Agotado' : ''}
                </span>
                <strong>+{currency(v.price)}</strong>
              </label>
            ))}
          </fieldset>
        )}
        <div className="modal-price">
          <span className="eyebrow">PRECIO</span>
          <strong>
            {options.length && !option
              ? 'Seleccioná una opción'
              : price === null
                ? p.price_label || 'Consultar'
                : currency(price)}{' '}
            <small>
              {price !== null && !p.price_label.startsWith('Consultar') ? p.price_label : ''}
            </small>
          </strong>
        </div>
        {!p.is_available && <p className="error">Agotado por el momento</p>}
        <button
          className="btn wide"
          disabled={!canOrder(p, option)}
          onClick={() =>
            openWhatsApp(
              phone,
              productMessage({
                name: p.name,
                category,
                option: [...options, ...addons].find((v) => v.id === option)?.name,
                price,
                table: tableFromSearch(window.location.search),
              }),
            )
          }
        >
          <MessageCircle size={19} /> Pedir en la mesa / Dudas
        </button>
        <p className="modal-note">Te respondemos por WhatsApp. Sin carrito, sin vueltas.</p>
      </div>
    </Modal>
  )
}
