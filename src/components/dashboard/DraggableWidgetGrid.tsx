'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'

interface Widget {
  id: string
  type: string
  title: string
  size?: { w: number; h: number }
}

interface DraggableWidgetGridProps {
  widgets: Widget[]
  onReorder: (widgets: Widget[]) => void
  renderWidget: (widget: Widget) => React.ReactNode
}

function SortableWidget({ 
  widget, 
  renderWidget,
  isDragging 
}: { 
  widget: Widget
  renderWidget: (widget: Widget) => React.ReactNode
  isDragging?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <div className="absolute top-2 right-2 z-10">
        <button
          className="p-2 hover:bg-gray-100 rounded-lg cursor-move touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      {renderWidget(widget)}
    </div>
  )
}

export default function DraggableWidgetGrid({
  widgets,
  onReorder,
  renderWidget,
}: DraggableWidgetGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id)
      const newIndex = widgets.findIndex((w) => w.id === over.id)
      
      const newWidgets = arrayMove(widgets, oldIndex, newIndex)
      onReorder(newWidgets)
    }

    setActiveId(null)
  }

  const activeWidget = widgets.find((w) => w.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={widgets.map(w => w.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              renderWidget={renderWidget}
              isDragging={widget.id === activeId}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeWidget ? (
          <div className="opacity-80 cursor-grabbing">
            {renderWidget(activeWidget)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}