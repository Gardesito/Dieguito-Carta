import { writeFileSync, readFileSync } from 'node:fs'
const slides = [
  [
    'hero',
    'Pizzas a la piedra',
    'Sabores irresistibles, ingredientes seleccionados y ese toque casero que nos caracteriza.',
    'Ver pizzas',
    'pizzas',
    'pizza',
    'Pizza artesanal a la piedra',
    [
      'Pizzas na pedra',
      'Sabores irresistíveis, ingredientes selecionados e aquele toque caseiro que nos caracteriza.',
      'Ver pizzas',
      'Pizza artesanal assada na pedra',
    ],
    [
      'Stone-baked pizzas',
      'Irresistible flavors, selected ingredients and our signature homemade touch.',
      'View pizzas',
      'Artisan stone-baked pizza',
    ],
  ],
  [
    'hero-grill',
    'El sabor de nuestra parrilla',
    'Carnes, cordero y platos preparados para disfrutar en Ushuaia.',
    'Ver parrillada',
    'parrillada',
    'parrilla',
    'Parrillada de carne y cordero',
    [
      'O sabor do nosso churrasco',
      'Carnes, cordeiro e pratos preparados para saborear em Ushuaia.',
      'Ver churrasco',
      'Churrasco de carne e cordeiro',
    ],
    [
      'The flavor of our grill',
      'Beef, lamb and dishes made to enjoy in Ushuaia.',
      'View grill',
      'Grilled beef and lamb',
    ],
  ],
  [
    'hero-sea',
    'Sabores del fin del mundo',
    'Centolla, merluza negra, salmón y especialidades del mar.',
    'Ver platos del mar',
    'del-mar',
    'mar',
    'Salmón y centolla en un plato',
    [
      'Sabores do fim do mundo',
      'Centolla, merluza negra, salmão e especialidades do mar.',
      'Ver pratos do mar',
      'Salmão e centolla em um prato',
    ],
    [
      'Flavors from the end of the world',
      'King crab, Patagonian toothfish, salmon and seafood specialties.',
      'View seafood',
      'Salmon and king crab on a plate',
    ],
  ],
]
const content = slides.map(
  ([content_key, title, body, button_label, category_slug, photo, image_alt, pt, en], i) => ({
    id: `30000000-0000-4000-8000-${String(i === 0 ? 1 : i + 2).padStart(12, '0')}`,
    content_key,
    title,
    subtitle: 'DIEGUITO · USHUAIA',
    body,
    image_url: `/images/hero/${photo}.png`,
    image_alt,
    button_label,
    button_url: `/#menu-${category_slug}`,
    metadata: { category_slug, sort_order: i },
    is_visible: true,
    translations: Object.fromEntries(
      [
        ['pt', pt],
        ['en', en],
      ].map(([lang, v]) => [
        lang,
        { title: v[0], body: v[1], button_label: v[2], image_alt: v[3] },
      ]),
    ),
  }),
)
content.push({
  id: '30000000-0000-4000-8000-000000000005',
  content_key: 'offer',
  title: 'Consultá nuestras promociones',
  subtitle: 'OFERTA ESPECIAL',
  body: 'Descubrí las promociones disponibles de esta semana.',
  image_url: '/images/hero/pizza.png',
  image_alt: 'Pizza artesanal',
  button_label: 'Ver promociones',
  button_url: '/#promociones',
  metadata: {},
  is_visible: true,
  translations: {
    pt: {
      title: 'Confira nossas promoções',
      subtitle: 'OFERTA ESPECIAL',
      body: 'Descubra as promoções disponíveis nesta semana.',
      button_label: 'Ver promoções',
      image_alt: 'Pizza artesanal',
    },
    en: {
      title: 'Ask about our promotions',
      subtitle: 'SPECIAL OFFER',
      body: "Discover this week's available promotions.",
      button_label: 'View promotions',
      image_alt: 'Artisan pizza',
    },
  },
})
export const homeContent = content
writeFileSync(
  'src/data/homeData.ts',
  `import type { SiteContent } from '../types/siteContent'\nexport const homeContent: SiteContent[] = ${JSON.stringify(content, null, 2)}\n`,
)
const q = (v) =>
  v === null
    ? 'null'
    : typeof v === 'object'
      ? `'${JSON.stringify(v).replaceAll("'", "''")}'::jsonb`
      : typeof v === 'string'
        ? `'${v.replaceAll("'", "''")}'`
        : String(v)
let sql = '-- Secciones iniciales del carrusel y banner, sin ofertas inventadas.\nbegin;\n'
for (const c of content) {
  const keys = Object.keys(c)
  sql += `insert into public.site_content(${keys.join(',')}) values(${keys.map((k) => q(c[k])).join(',')}) on conflict(content_key) do update set ${keys
    .filter((k) => !['id', 'content_key'].includes(k))
    .map((k) => `${k}=excluded.${k}`)
    .join(',')} where public.site_content.title='El sabor de Ushuaia';\n`
}
sql +=
  "update public.products set is_featured=true where slug in ('pizzas-muzzarella','hamburguesas-caseras-dieguito-casera-con-fritas','empanadas-carne');\ncommit;\n"
writeFileSync('supabase/seed-home.sql', sql)
// seed.sql integrates the home seed without duplicating the block on regeneration.
const seed = readFileSync('supabase/seed.sql', 'utf8').split(
  '-- Secciones iniciales del carrusel',
)[0]
writeFileSync('supabase/seed.sql', seed + '\n' + sql)
