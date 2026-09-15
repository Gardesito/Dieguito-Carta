export const categoryNames = [
  ['Sanduíches', 'Sandwiches'],
  ['Churrasco', 'Grill'],
  ['Do Mar', 'Seafood'],
  ['Pratos Especiais', 'Special Dishes'],
  ['Empanadas', 'Empanadas'],
  ['Pratos Rápidos', 'Quick Dishes'],
  ['Pizzas', 'Pizzas'],
  ['Pizzas da Baía', 'Bay Pizzas'],
  ['Hambúrgueres Caseiros', 'Homemade Burgers'],
  ['Massas', 'Pasta'],
  ['Sobremesas', 'Desserts'],
  ['Bebidas', 'Soft Drinks'],
  ['Cervejas', 'Beers'],
  ['Vinhos', 'Wines'],
]
export const featuredSlugs = [
  'pizzas-muzzarella',
  'hamburguesas-caseras-dieguito-casera-con-fritas',
  'empanadas-carne',
]
export function categoryTranslations(category, i) {
  return {
    pt: { name: categoryNames[i][0], description: translateNote(category.description, 'pt') },
    en: { name: categoryNames[i][1], description: translateNote(category.description, 'en') },
  }
}
export function translateNote(note, lang) {
  const notes = {
    'Estos platos se pueden acompañar con puré, papa natural, papas fritas o ensalada.': [
      'Estes pratos podem ser acompanhados de purê, batata cozida, batatas fritas ou salada.',
      'These dishes can be served with mashed potatoes, boiled potatoes, fries or salad.',
    ],
    'Todas las pizzas tienen orégano y aceitunas.': [
      'Todas as pizzas levam orégano e azeitonas.',
      'All pizzas include oregano and olives.',
    ],
    'Todos los precios corresponden a una unidad.': [
      'Todos os preços são por unidade.',
      'All prices are per item.',
    ],
  }
  return notes[note]?.[lang === 'pt' ? 0 : 1] || ''
}
export function productTranslations(p) {
  const result = {
    pt: { description: translateNote(p.description, 'pt') },
    en: { description: translateNote(p.description, 'en') },
  }
  if (p.slug === 'pizzas-muzzarella') {
    result.pt.name = 'Mussarela'
    result.en.name = 'Mozzarella'
    result.pt.ingredients = 'molho e mussarela.'
    result.en.ingredients = 'sauce and mozzarella.'
  }
  if (p.slug === 'empanadas-carne') {
    result.pt.name = 'Carne'
    result.en.name = 'Beef'
  }
  if (p.slug === 'hamburguesas-caseras-dieguito-casera-con-fritas') {
    result.pt.name = 'Dieguito Caseiro com Fritas'
    result.en.name = 'Dieguito Homemade Burger with Fries'
    result.pt.ingredients =
      'carne, cheddar duplo, tomate, alface, bacon, cebola, ovo e batatas fritas.'
    result.en.ingredients = 'beef, double cheddar, tomato, lettuce, bacon, onion, egg and fries.'
  }
  return result
}
