import { ArrowUpRight, MessageCircle } from 'lucide-react'
import type { SiteContent } from '../../../types/siteContent'
import type { Promotion } from '../../../types/promotion'
import FoodImage from '../../common/FoodImage'
import { openWhatsApp } from '../../../services/whatsapp.service'
import { safeUrl } from '../../../utils/image'
import { preserveTable } from '../../../utils/navigation'
export default function Hero({
  content,
  phone,
  promotion,
}: {
  content: SiteContent
  phone: string
  promotion?: Promotion
}) {
  if (!content.is_visible) return null
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> {content.subtitle}
          </p>
          <h1>{content.title}</h1>
          <p className="hero-description">{content.body}</p>
          <div className="row">
            <a
              className="btn hero-cta"
              href={preserveTable(safeUrl(content.button_url, true) || '/#menu')}
            >
              {content.button_label}
              <ArrowUpRight size={21} />
            </a>
            <button className="hero-whatsapp" onClick={() => openWhatsApp(phone)}>
              <MessageCircle size={20} />
              Pedir por WhatsApp
            </button>
          </div>
          <div className="hero-note">
            <span>Hecho en casa.</span> Para compartir.
          </div>
        </div>
        <div className="hero-visual">
          <FoodImage src={content.image_url} alt={content.image_alt || content.title} priority />
          <div className="hero-seal">
            BUENA COMIDA
            <br />
            <strong>Buen momento.</strong>
            <span>DESDE USHUAIA, CON SABOR</span>
          </div>
          {promotion && (
            <a href={preserveTable('/#promociones')} className="hero-promo">
              {promotion.title} <ArrowUpRight size={18} />
            </a>
          )}
        </div>
      </div>
      <div className="mountains" aria-hidden="true" />
    </section>
  )
}
