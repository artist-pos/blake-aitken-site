'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'

interface Item {
  id: string
}

interface Props<T extends Item> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, dragHandleProps: React.HTMLAttributes<HTMLElement>) => ReactNode
}

function SortableItem<T extends Item>({
  item,
  renderItem,
}: {
  item: T
  renderItem: Props<T>['renderItem']
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      {renderItem(item, { ...attributes, ...listeners, style: { cursor: 'grab', touchAction: 'none' } })}
    </div>
  )
}

export default function SortableList<T extends Item>({ items, onReorder, renderItem }: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      onReorder(arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableItem key={item.id} item={item} renderItem={renderItem} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
