import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Copy, Eye, EyeOff, Trash2 } from 'lucide-react'
import type { Product } from '../../../types/product'
import type { Category } from '../../../types/category'
import { currency } from '../../../utils/currency'
import { imageSrc } from '../../../utils/image'
interface Props {
  products: Product[]
  categories: Category[]
  onEdit: (p: Product) => void
  onDuplicate: (p: Product) => void
  onToggle: (p: Product) => void
  onDelete: (p: Product) => void
  onReorder: (ids: string[]) => void
  disabled: boolean
  sortable: boolean
}
function ProductRow({
  product: p,
  ...props
}: Omit<Props, 'products' | 'onReorder'> & { product: Product }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: p.id,
    disabled: props.disabled || !props.sortable,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="admin-product-row"
    >
      <button
        className="drag-handle"
        {...attributes}
        {...listeners}
        disabled={props.disabled || !props.sortable}
        aria-label={`Mover ${p.name}`}
      >
        <GripVertical size={20} />
      </button>
      <img src={imageSrc(p.image_url)} alt="" width={56} height={56} />
      <div className="admin-product-name">
        <strong>{p.name}</strong>
        <small>{props.categories.find((c) => c.id === p.category_id)?.name}</small>
        <small>
          {p.is_available ? 'Disponible' : 'Agotado'} · {p.is_visible ? 'Visible' : 'Oculto'}
        </small>
      </div>
      <strong className="admin-row-price">
        {currency(p.price ?? p.small_price ?? p.product_variants[0]?.price)}
      </strong>
      <div className="row action-buttons">
        <button
          className="icon-btn"
          aria-label={`Editar ${p.name}`}
          disabled={props.disabled}
          onClick={() => props.onEdit(p)}
        >
          <Pencil size={17} />
        </button>
        <button
          className="icon-btn"
          aria-label={`Duplicar ${p.name}`}
          disabled={props.disabled}
          onClick={() => props.onDuplicate(p)}
        >
          <Copy size={17} />
        </button>
        <button
          className="icon-btn"
          aria-label={`${p.is_visible ? 'Ocultar' : 'Mostrar'} ${p.name}`}
          disabled={props.disabled}
          onClick={() => props.onToggle(p)}
        >
          {p.is_visible ? <Eye size={17} /> : <EyeOff size={17} />}
        </button>
        <button
          className="icon-btn"
          aria-label={`Eliminar ${p.name}`}
          disabled={props.disabled}
          onClick={() => props.onDelete(p)}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  )
}
export default function ProductTable(props: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id) {
          const ids = props.products.map((p) => p.id)
          props.onReorder(
            arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))),
          )
        }
      }}
    >
      <SortableContext
        items={props.products.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="admin-product-list">
          {props.products.map((p) => (
            <ProductRow key={p.id} product={p} {...props} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
