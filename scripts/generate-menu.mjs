import { writeFileSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const uuid = (s) => {
  const h = createHash('sha256').update(`dieguito-menu:${s}`).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`
}
const garnish = 'Estos platos se pueden acompañar con puré, papa natural, papas fritas o ensalada.'
const pizzaNote = 'Todas las pizzas tienen orégano y aceitunas.'
// Nombre | precio único o chico | grande | ingredientes. Importes en pesos argentinos.
const sections = [
  [
    'Sándwiches',
    garnish,
    `Bondiola|20000
Hamburguesa con jamón, queso y fritas|13000
Hamburguesa completa y fritas|16000
Lomito con jamón, queso y fritas|22000
Lomito completo con fritas|26000
Milanesa con jamón, queso y fritas|18000
Milanesa completa con fritas|23000
Suprema con jamón, queso y fritas|19000
Suprema completa con fritas|22000
Vacío|24000`,
  ],
  [
    'Parrillada',
    '',
    `Vacío|27000
Bondiola|22000
Matambre de cerdo|33000
Chorizo|7000
Morcilla|7000
Cordero|29000
Matambre a la pizza|27000
Chinchullín|9500
Promo Parrilla Mixta para 2, sin guarnición|84000`,
  ],
  [
    'Del Mar',
    '',
    `Merluza negra a la parrilla|43000
Salmón grillé|30000
Centolla parmesana con langostino|62000
Arroz con centolla|40000
Cazuela de mariscos|27000
Arroz con mariscos|26000
Tallarines con mariscos|25000
Centolla natural|55000
Abadejo grillé|24000
Parrillada mixta de mar para 2, sin guarnición|90000`,
  ],
  [
    'Platos Especiales',
    garnish,
    `Cordero a la mostaza|24000
Cordero al champiñón|24000
Estofado de cordero|24000
Lomo al champiñón|27000
Lomo al grillé|27000
Lomo a la mostaza|29000
Pechuga de pollo a la mostaza|24000`,
  ],
  [
    'Empanadas',
    'Todos los precios corresponden a una unidad.',
    `Carne|4000
Pollo|4000
Jamón y queso|4000
Queso y cebolla|4000
Humita|4000
Carne cortada a cuchillo|4500
Atún|4000
Verdura|4000
Roquefort, apio y muzzarella|4000
Cebolla, huevo y muzzarella|4000
Carne dulce|4000
Pollo al verdeo|4000
Matambre|4500
Tomate, albahaca y muzzarella|4000
Panceta, cebolla y muzzarella|4500
Panceta y ciruela|4500
Bondiola y azúcar negra|4500
Árabe|4500
Cordero|5000
Cantimpalo, muzzarella y huevo|4000`,
  ],
  [
    'Minutas',
    garnish,
    `Bife|26000
Bife al champiñón|30000
Milanesa a la napolitana|25000
Milanesa|20000
Pechuga rellena|22000
Pollo al ajillo|21000
Pollo con champiñón|23000
Pollo grillé|20000
Suprema|22000
Suprema a la napolitana|26000`,
  ],
  [
    'Pizzas',
    pizzaNote,
    `Muzzarella|12000|19000|salsa y muzzarella.
Jamón|14000|21000|muzzarella y jamón.
Especial Morrones|15000|24000|salsa, muzzarella, jamón y morrones.
Napolitana|15500|25000|salsa, muzzarella, tomate en rodajas y ajo.
Especial con Huevo|15500|25000|salsa, muzzarella, jamón, morrones y huevo.
Fugazzeta|14000|21000|cebolla, muzzarella, jamón y salsa.
Fugazza|13000|20000|cebolla y muzzarella.
Jamón Crudo|17000|27000|salsa, muzzarella y jamón crudo.
Roquefort|17000|27000|jamón, salsa, muzzarella, roquefort y albahaca.
Americana|20000|32000|salsa, muzzarella, huevo frito, panceta, morrón y papas fritas.
Anchoas|17000|27000|salsa, muzzarella, anchoas y ají molido.
Calabreza|17500|28000|salsa, muzzarella, tomate en rodajas y salame.
Cantimpalo|15500|28000|salsa, muzzarella y cantimpalo.
Duende|18000|30000|crema al verdeo, champiñón, jamón, panceta y salsa.
Dieguito|18000|30000|champiñón, provolone, tomate, morrón, ajo, panceta y muzzarella.
Especial de Verdura|17000|27000|salsa blanca, acelga y queso sardo.
Fugazzeta Especial|17500|28000|cebolla, muzzarella, anchoas, ajo y salsa.
Palmitos|17500|28000|salsa, muzzarella, jamón, palmitos y salsa golf.
Provenzal|14000|22000|salsa, muzzarella, ajo y perejil.
Provolone|18000|30000|salsa, muzzarella, provolone, tomates y albahaca.
Rúcula|20000|34000|salsa, muzzarella, jamón crudo, rúcula, tomates y ajo.
4 Quesos|18000|30000|salsa, muzzarella, roquefort, provolone y queso sardo.`,
  ],
  [
    'Pizzas de la Bahía',
    '',
    `Centolla Mixta|35000|65000|camarón y vieiras.
Centolla|40000|80000|salsa golf.
Mariscos|26000|40000|mejillón, langostino, calamar y almejas.
Medio Mundo|42000|80000|mariscos, merluza negra y abadejo.
Mejillones a la Provenzal|20000|40000
Merluza Negra||`,
  ],
  [
    'Hamburguesas Caseras',
    '',
    `Casera Simple con Fritas|16000||carne, cheddar y papas fritas.
Doble Casera Simple con Fritas|19000||2 carnes, cheddar y papas fritas.
Triple Casera Simple con Fritas|22000||3 carnes, cheddar y papas fritas.
Súper Casera Simple con Fritas|18000||carne, cheddar, panceta y papas fritas.
Doble Súper Casera Simple con Fritas|21000||2 carnes, cheddar, panceta y papas fritas.
Triple Súper Casera Simple con Fritas|24000||3 carnes, cheddar, panceta y papas fritas.
Max Casera|20000||carne, cheddar, panceta, huevo y papas fritas.
Doble Max Casera con Fritas|22000||2 carnes, cheddar, panceta, huevo y papas fritas.
Triple Max Casera con Fritas|26000||3 carnes, cheddar, panceta, huevo y papas fritas.
Dieguito Casera con Fritas|20000||carne, doble cheddar, tomate, lechuga, panceta, cebolla, huevo y papas fritas.`,
  ],
  [
    'Pastas',
    '',
    `Canelones de verdura|19000
Ñoquis|16000
Sorrentinos de verdura|22000
Sorrentinos de pollo|22000
Sorrentinos de centolla|29000
Sorrentinos de jamón y queso|22000
Sorrentinos de salmón|28000
Sorrentinos de osobuco|28000
Sorrentinos de cordero|28000
Tallarines|15000`,
  ],
  [
    'Postres',
    '',
    `Bombón Calafate
Bombón Suizo
Budín de Pan
Choco Oreo
Flan Casero
Tiramisú
Vigilante
Adicional`,
  ],
  [
    'Bebidas',
    '',
    `Agua 500 ml / Agua con gas|3500
Agua saborizada 500 ml|3500
Agua saborizada 1,5 L|6000
Gaseosa 500 ml|4000
Gaseosa 1,5 L|8000
Gaseosa lata|3300
Gaseosa 2,25 L|12000`,
  ],
  [
    'Cervezas',
    '',
    `Beagle|10000
Cape Horn|8000
Corona|9500
Heineken|10000
Cerveza tirada, pinta|8000
Lata de 500 cc|4500
Patagonia|8500
Quilmes|8000
Stella Artois, lata|6000
Cinzano|8000
Gancia|8000
Gin tonic|8000
Aperol|8000
Fernet|8000
Medida de whisky Red Label|7000`,
  ],
  [
    'Vinos',
    '',
    `Santa Julia lata|6000
Copa de vino|6000
Santa Julia chico|7500
Cazador|7500
Hormiga Negra|8500
Alaris|8500
Alaris blanco|8500
Otro Loco Más|9500
El Náufrago|11000
Santa Julia Chenin|11000
Donde Manda Capitán...|11000
Aturdido|11000
Alma Mora blanco|13000
Fond de Cave / La Linda|14500
Escorihuela Familia|14500
Bosco M.|14500
Alma Mora|15500
Santa Julia Malbec|15500
Trumpeter|15000
Elementos Malbec|14500
Calia blanco|15500
Gran Loco Blend|17000
Cafayate Cabernet|17000
Latitud 33|17000
Tucumen tinto|17000
Calia tinto|18000
Flores Negras Pinot Noir|19500
Cordero con Piel de Lobo|19500
Portillo|19500
Don David Blanco Reserva|19500
Fond de Cave|19500
Álamos|20500
Alma Mora Reserva|21500
Don David|21500
Escorihuela Gascón|23000
Alambrado|26500
El Enemigo|29000
Luigi Bosca|34800
Killka|34800
D. V. Catena|55200`,
  ],
]
const sauces = [
  ['Fileto', 2000],
  ['Roquefort', 5000],
  ['Bolognesa', 5000],
  ['Estofado', 5000],
  ['4 Quesos', 5000],
  ['Blanca', 5000],
  ['Roja', 5000],
  ['Verdeo', 5000],
  ['Langostino', 8000],
]
const categories = sections.map(([name, description], sort_order) => ({
  id: uuid(slug(name)),
  name,
  slug: slug(name),
  description,
  image_url: '',
  image_alt: '',
  icon: '',
  sort_order,
  is_active: true,
}))
const products = sections.flatMap(([category, note, lines], i) =>
  lines.split('\n').map((line, sort_order) => {
    const [name, amount, large, ingredients = ''] = line.split('|')
    const key = slug(`${category === 'Sándwiches' ? 'sandwich' : category} ${name}`)
    const id = uuid(key),
      pizza = category.startsWith('Pizzas')
    return {
      id,
      category_id: categories[i].id,
      name,
      slug: key,
      description:
        name === 'Parrillada mixta de mar para 2, sin guarnición'
          ? 'Abadejo, salmón y merluza negra.'
          : note,
      ingredients,
      image_url: '',
      image_alt: name,
      price: pizza || !amount ? null : Number(amount),
      small_price: pizza && amount ? Number(amount) : null,
      large_price: pizza && large ? Number(large) : null,
      price_label: category === 'Empanadas' ? 'Por unidad' : !amount ? 'Consultar precio' : '',
      is_available: true,
      is_featured: false,
      is_visible: true,
      sort_order,
      product_variants:
        category === 'Pastas'
          ? sauces.map(([name, price], sort_order) => ({
              id: uuid(`${key}-${slug(name)}`),
              product_id: id,
              name,
              price,
              sort_order,
              is_available: true,
              is_addon: true,
            }))
          : [],
    }
  }),
)
writeFileSync(
  'src/data/menuData.ts',
  `// Carta transcripta del texto proporcionado. Regenerar con node scripts/generate-menu.mjs.\nimport type { Category } from '../types/category'\nimport type { Product } from '../types/product'\nexport const menuCategories: Category[] = ${JSON.stringify(categories, null, 2)}\nexport const menuProducts: Product[] = ${JSON.stringify(products, null, 2)}\n`,
)
const sqlValue = (v) =>
  v === null ? 'null' : typeof v === 'string' ? `'${v.replaceAll("'", "''")}'` : String(v)
const cleanup = `-- Retirar únicamente registros identificados del seed de demostración anterior.\ndelete from public.promotions where id='20000000-0000-4000-8000-000000000001' and title='Hoy se comparte';\ndelete from public.products where id::text like '10000000-0000-4000-8000-%' and slug in ('muzzarella','hamburguesa-dieguito','empanada-de-carne','rabas','promo-19');\ndelete from public.categories c where id::text like '00000000-0000-4000-8000-%' and slug in ('promos','entradas','milanesas-del-bodegon','calzones','menu-del-dia') and not exists(select 1 from public.products p where p.category_id=c.id);\n`
let sql =
  '-- Carta completa. Ejecutar después de las migraciones. Reejecutar restaura los valores de la carta; conserva fotos existentes.\nbegin;\n' +
  cleanup
for (const c of categories) {
  const keys = Object.keys(c)
  sql += `insert into public.categories(${keys.join(',')}) values (${keys.map((k) => sqlValue(c[k])).join(',')}) on conflict(slug) do update set ${keys
    .filter((k) => !['id', 'slug', 'image_url', 'image_alt'].includes(k))
    .map((k) => `${k}=excluded.${k}`)
    .join(',')};\n`
}
for (const p of products) {
  const { product_variants, ...row } = p,
    keys = Object.keys(row),
    c = categories.find((c) => c.id === p.category_id)
  sql += `insert into public.products(${keys.join(',')}) values (${keys.map((k) => (k === 'category_id' ? `(select id from public.categories where slug=${sqlValue(c.slug)})` : sqlValue(row[k]))).join(',')}) on conflict(slug) do update set ${keys
    .filter((k) => !['id', 'slug', 'image_url', 'image_alt'].includes(k))
    .map((k) => `${k}=excluded.${k}`)
    .join(',')};\n`
  for (const v of product_variants) {
    const keys = Object.keys(v)
    sql += `insert into public.product_variants(${keys.join(',')}) values (${keys.map((k) => (k === 'product_id' ? `(select id from public.products where slug=${sqlValue(p.slug)})` : sqlValue(v[k]))).join(',')}) on conflict(id) do update set ${keys
      .filter((k) => k !== 'id')
      .map((k) => `${k}=excluded.${k}`)
      .join(',')};\n`
  }
}
sql += 'commit;\n'
writeFileSync('supabase/seed-menu.sql', sql)
const existing = readFileSync('supabase/seed.sql', 'utf8')
const settings = existing.slice(existing.indexOf('insert into public.site_content'))
writeFileSync(
  'supabase/seed.sql',
  sql + '\n-- Contenido y configuración existentes: no sobrescribir.\nbegin;\n' + settings,
)
console.log(
  JSON.stringify({
    total: products.length,
    categories: categories.map((c) => [
      c.name,
      products.filter((p) => p.category_id === c.id).length,
    ]),
    variants: products.flatMap((p) => p.product_variants).length,
  }),
)
