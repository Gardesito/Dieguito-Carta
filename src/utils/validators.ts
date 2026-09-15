import { z } from 'zod'
const money = z.number().min(0, 'El precio no puede ser negativo.').max(9999999999).nullable()
export const productSchema = z.object({
  name: z.string().trim().min(2, 'Escribí al menos 2 letras.').max(120),
  slug: z.string().min(1),
  category_id: z.string().uuid('Elegí una categoría.'),
  description: z.string().max(2000),
  ingredients: z.string().max(2000),
  price: money,
  small_price: money,
  large_price: money,
  price_label: z.string().max(30),
  image_url: z.string(),
  image_alt: z.string().max(200),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  is_visible: z.boolean(),
  sort_order: z.number().int(),
  product_variants: z.array(
    z.object({
      id: z.string(),
      product_id: z.string(),
      name: z.string().trim().min(1, 'La variante necesita un nombre.'),
      price: z.number().min(0),
      sort_order: z.number().int(),
      is_available: z.boolean(),
      is_addon: z.boolean().optional(),
    }),
  ),
})
export type ProductValues = z.infer<typeof productSchema>
