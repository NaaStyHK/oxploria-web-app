'use client'

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

type DraggableSheetProps = {
  children: ReactNode
  className: string
  dismissLabel: string
  onDismiss: () => void
}

export function DraggableSheet({ children, className, dismissLabel, onDismiss }: DraggableSheetProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const activePointer = useRef<number | null>(null)
  const dragged = useRef(false)

  const finish = (delta = 0, cancelled = false) => {
    if (activePointer.current === null) return
    activePointer.current = null
    setDragging(false)
    setOffset(0)
    if (cancelled) return
    if (delta > 72) onDismiss()
  }

  useEffect(() => {
    const cancel = () => finish(0, true)
    window.addEventListener('blur', cancel)
    return () => window.removeEventListener('blur', cancel)
  })

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    activePointer.current = event.pointerId
    startY.current = event.clientY
    dragged.current = false
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== event.pointerId) return
    const delta = event.clientY - startY.current
    const nextOffset = Math.max(0, delta)
    if (Math.abs(delta) > 5) dragged.current = true
    setOffset(nextOffset)
  }

  const onPointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== event.pointerId) return
    finish(event.clientY - startY.current)
  }

  return <div className={`${className} draggable-sheet${dragging ? ' is-dragging' : ''}`} style={{ transform: `translateY(${offset}px)` }}>
    <button
      className="sheet-drag-handle"
      type="button"
      aria-label={dismissLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={() => finish(0, true)}
      onLostPointerCapture={() => finish(0, true)}
      onClick={() => {
        if (!dragged.current) onDismiss()
        dragged.current = false
      }}
    ><span aria-hidden="true" /></button>
    {children}
  </div>
}
