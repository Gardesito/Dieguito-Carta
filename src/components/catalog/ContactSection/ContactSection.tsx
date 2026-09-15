import { MapPin, Clock, Camera, ArrowUpRight, MessageCircle } from 'lucide-react'
import type { SiteContent, SiteSettings } from '../../../types/siteContent'
import FoodImage from '../../common/FoodImage'
import { safeUrl } from '../../../utils/image'
import { preserveTable } from '../../../utils/navigation'
import { openWhatsApp } from '../../../services/whatsapp.service'
export default function ContactSection({
  about,
  settings: s,
}: {
  about?: SiteContent
  settings: SiteSettings
}) {
  const maps =
    safeUrl(s.maps_url) ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`
  return (
    <>
      {about?.is_visible && (
        <section className="about section container" id="nosotros">
          <div className="about-photo">
            <FoodImage src={about.image_url} alt={about.image_alt || about.title} />
            <span>
              El fin del mundo.
              <br />
              <em>El principio de una buena mesa.</em>
            </span>
          </div>
          <div>
            <p className="eyebrow primary">{about.subtitle}</p>
            <h2>{about.title}</h2>
            <p className="muted">{about.body}</p>
            <a
              className="btn secondary"
              href={preserveTable(safeUrl(about.button_url, true) || maps)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {about.button_label || 'Cómo llegar'}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
      )}
      <section id="contacto" className="contact section">
        <div className="container">
          <p className="eyebrow">CERQUITA TUYO</p>
          <h2>Nos vemos en Dieguito.</h2>
          <div className="contact-grid">
            <div>
              <MapPin />
              <h3>En el corazón de Ushuaia</h3>
              <p>{s.address}</p>
              <a href={maps} target="_blank" rel="noopener noreferrer">
                Cómo llegar ↗
              </a>
            </div>
            <div>
              <Clock />
              <h3>Te esperamos</h3>
              <ul className="hours">
                {s.opening_hours.map((h) => (
                  <li key={h.day}>
                    <span>{h.day}</span>
                    <span>{h.closed ? 'Cerrado' : h.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <MessageCircle />
              <h3>Hablemos de comida</h3>
              <p>Pedidos, consultas o una mesa para compartir.</p>
              <button className="btn whatsapp" onClick={() => openWhatsApp(s.whatsapp_number)}>
                Escribinos por WhatsApp
              </button>
              <div className="row social">
                {safeUrl(s.instagram_url) && (
                  <a href={safeUrl(s.instagram_url)} target="_blank" rel="noopener noreferrer">
                    <Camera size={18} /> Instagram
                  </a>
                )}
                {safeUrl(s.facebook_url) && (
                  <a href={safeUrl(s.facebook_url)} target="_blank" rel="noopener noreferrer">
                    Facebook â†—
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
