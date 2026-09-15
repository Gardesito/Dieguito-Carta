import { tr } from '../../../i18n'
import { ArrowUpRight } from 'lucide-react'
import type { Promotion } from '../../../types/promotion'
import { currency } from '../../../utils/currency'
import { isPromotionActive } from '../../../utils/promotions'
import { productMessage, tableFromSearch } from '../../../utils/whatsapp'
import { openWhatsApp } from '../../../services/whatsapp.service'
import FoodImage from '../../common/FoodImage'
import { usePromotionTime } from '../../../hooks/usePromotionTime'
export default function PromotionSlider({
  promotions,
  phone,
}: {
  promotions: Promotion[]
  phone: string
}) {
  const now = usePromotionTime(promotions)
  const active = promotions
    .filter((p) => isPromotionActive(p, now))
    .sort((a, b) => a.sort_order - b.sort_order)
  return (
    <section id="promociones" className="promotions section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow primary">{tr('Promociones')}</p>
            <h2>{tr('Promociones de la semana')}</h2>
          </div>
        </div>
        {active.length ? (
          <div className="promotion-track">
            {active.map((p) => (
              <article className="promotion-card" key={p.id}>
                <div>
                  <span className="eyebrow">{tr(p.label || 'OFERTA ESPECIAL')}</span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="row">
                    {p.previous_price !== null && <del>{currency(p.previous_price)}</del>}
                    {p.current_price !== null && <strong>{currency(p.current_price)}</strong>}
                  </div>
                  <button
                    className="btn"
                    onClick={() =>
                      openWhatsApp(
                        phone,
                        productMessage({
                          name: p.title,
                          category: tr('Promociones'),
                          price: p.current_price,
                          table: tableFromSearch(location.search),
                        }),
                      )
                    }
                  >
                    {p.button_label || tr('Quiero esta promo')} <ArrowUpRight size={18} />
                  </button>
                </div>
                <FoodImage src={p.image_url} alt={p.image_alt || p.title} />
              </article>
            ))}
          </div>
        ) : (
          <p>{tr('Estamos preparando nuevas promociones. ¡Volvé pronto!')}</p>
        )}
      </div>
    </section>
  )
}
