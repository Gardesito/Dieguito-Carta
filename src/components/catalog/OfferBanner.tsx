import { useTranslation } from 'react-i18next'
import type { Promotion } from '../../types/promotion'
import type { SiteContent } from '../../types/siteContent'
import { localized } from '../../i18n'
import { usePromotionTime } from '../../hooks/usePromotionTime'
import { isPromotionActive } from '../../utils/promotions'
import { currency } from '../../utils/currency'
import { productMessage, tableFromSearch } from '../../utils/whatsapp'
import { openWhatsApp } from '../../services/whatsapp.service'
import FoodImage from '../common/FoodImage'
import { preserveTable } from '../../utils/navigation'
export default function OfferBanner({
  promotions,
  general,
  phone,
}: {
  promotions: Promotion[]
  general?: SiteContent
  phone: string
}) {
  const { t, i18n } = useTranslation(),
    now = usePromotionTime(promotions)
  const raw = promotions
    .filter((p) => isPromotionActive(p, now))
    .sort((a, b) => a.sort_order - b.sort_order)[0]
  const p = raw ? localized(raw, i18n.resolvedLanguage) : undefined
  const g = general ? localized(general, i18n.resolvedLanguage) : undefined
  if (!p && (!g || !g.is_visible)) return null
  return (
    <section className="offer-banner container" aria-label={p?.title || g?.title}>
      <div>
        <p className="eyebrow">{t(p?.label || g?.subtitle || 'OFERTA ESPECIAL')}</p>
        <h2>{p?.title || g?.title}</h2>
        <p>{p ? p.description : g?.body}</p>
        {p && (
          <div className="offer-prices">
            {p.previous_price != null && <del>{currency(p.previous_price)}</del>}
            {p.current_price != null && <strong>{currency(p.current_price)}</strong>}
          </div>
        )}
        {p ? (
          <button
            className="btn"
            onClick={() =>
              openWhatsApp(
                phone,
                productMessage({
                  name: p.title,
                  category: t('Promociones'),
                  price: p.current_price,
                  table: tableFromSearch(location.search),
                }),
              )
            }
          >
            {p.button_label || t('Quiero esta promo')}
          </button>
        ) : (
          <a className="btn" href={preserveTable('/#promociones')}>
            {g?.button_label || t('Ver promociones')}
          </a>
        )}
      </div>
      <FoodImage
        src={p ? p.image_url : g?.image_url || ''}
        alt={p ? p.image_alt : g?.image_alt || ''}
      />
    </section>
  )
}
