import { tr } from '../../../i18n'
import {
  Beef,
  Beer,
  Fish,
  Flame,
  Grid2X2,
  Pizza,
  Sandwich,
  UtensilsCrossed,
  Wine,
} from 'lucide-react'
import type { Category } from '../../../types/category'
import { imageSrc } from '../../../utils/image'
function CategoryIcon({ name }: { name: string }) {
  if (/pizza/i.test(name)) return <Pizza />
  if (/mar/i.test(name)) return <Fish />
  if (/hamburg|sándwich/i.test(name)) return <Sandwich />
  if (/parrill/i.test(name)) return <Beef />
  if (/cerve|bebida/i.test(name)) return <Beer />
  if (/vino/i.test(name)) return <Wine />
  if (/promo/i.test(name)) return <Flame />
  return <UtensilsCrossed />
}
export default function CategoryNavigation({
  categories,
  value,
  onChange,
}: {
  categories: Category[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="category-nav" aria-label={tr('Categorías')}>
      <button
        className={`category ${!value ? 'active' : ''}`}
        aria-pressed={!value}
        onClick={() => onChange('')}
      >
        <Grid2X2 />
        <span>{tr('Todos')}</span>
      </button>
      {categories
        .filter((c) => c.is_active)
        .map((c) => (
          <button
            key={c.id}
            className={`category ${value === c.id ? 'active' : ''}`}
            aria-pressed={value === c.id}
            onClick={() => onChange(c.id)}
          >
            {c.image_url ? (
              <img src={imageSrc(c.image_url)} width={30} height={30} alt={c.image_alt} />
            ) : (
              <CategoryIcon name={c.slug} />
            )}
            <span>{c.name}</span>
          </button>
        ))}
    </div>
  )
}
