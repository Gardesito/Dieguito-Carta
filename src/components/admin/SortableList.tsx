import type { ReactNode } from 'react'
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
import { GripVertical } from 'lucide-react'
function Row({ id, children, disabled }: { id: string; children: ReactNode; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled })
  return (
    <div
      className="sortable-row"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        className="drag-handle"
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label="Mover categoría"
      >
        <GripVertical size={20} />
      </button>
      {children}
    </div>
  )
}
export default function SortableList({
  items,
  onReorder,
  render,
  disabled,
}: {
  items: { id: string }[]
  onReorder: (ids: string[]) => void
  render: (id: string) => ReactNode
  disabled: boolean
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = items.map((i) => i.id)
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id)
          onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {ids.map((id) => (
          <Row id={id} key={id} disabled={disabled}>
            {render(id)}
          </Row>
        ))}
      </SortableContext>
    </DndContext>
  )
}
