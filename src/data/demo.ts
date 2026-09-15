import type { Promotion } from '../types/promotion'
import type { SiteContent, SiteSettings } from '../types/siteContent'
import { homeContent } from './homeData'
import { siteConfig } from '../config/site'
export const photos = {
  pizza:
    'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=85',
  burger:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
  empanada:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Empanadas_argentinas_de_carne_hechas_al_horno.jpg/960px-Empanadas_argentinas_de_carne_hechas_al_horno.jpg',
  rabas:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Calamares_a_la_Romana-2009.jpg/960px-Calamares_a_la_Romana-2009.jpg',
  chicken:
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=80',
}
export { menuCategories as demoCategories, menuProducts as demoProducts } from './menuData'
export const demoPromotions: Promotion[] = []
export const demoContent: SiteContent[] = [
  ...homeContent,
  {
    id: '30000000-0000-4000-8000-000000000002',
    content_key: 'about',
    translations: {
      pt: {
        title: 'Aqui sempre há lugar para mais um.',
        subtitle: 'SUA MESA NO FIM DO MUNDO',
        body: 'Sabores de sempre, porções para compartilhar e o aconchego de uma boa mesa. Esperamos você na Magallanes 967, no coração de Ushuaia.',
        button_label: 'Como chegar',
        image_alt: 'Uma mesa para compartilhar',
      },
      en: {
        title: 'There is always room for one more here.',
        subtitle: 'YOUR TABLE AT THE END OF THE WORLD',
        body: 'Familiar flavors, portions to share and the warmth of a good table. Visit us at Magallanes 967, in the heart of Ushuaia.',
        button_label: 'Get directions',
        image_alt: 'A table to share',
      },
    },
    title: 'Acá, siempre hay lugar para uno más.',
    subtitle: 'TU MESA EN EL FIN DEL MUNDO',
    body: 'Sabores de siempre, porciones para compartir y el calor de una buena mesa. Te esperamos en Magallanes 967, en el corazón de Ushuaia.',
    image_url: photos.rabas,
    image_alt: 'Una mesa para compartir',
    button_label: 'Cómo llegar',
    button_url: 'https://www.google.com/maps/search/?api=1&query=Magallanes+967+Ushuaia',
    metadata: {},
    is_visible: true,
  },
]
export const demoSettings: SiteSettings = {
  id: '40000000-0000-4000-8000-000000000001',
  business_name: siteConfig.name,
  whatsapp_number: siteConfig.whatsapp,
  address: siteConfig.address,
  maps_url: siteConfig.mapsUrl,
  instagram_url: siteConfig.instagram,
  facebook_url: '',
  opening_hours: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(
    (day) => ({ day, hours: 'Consultar en el local', closed: false }),
  ),
  logo_url: siteConfig.logoUrl,
  logo_alt: 'Dieguito',
}
