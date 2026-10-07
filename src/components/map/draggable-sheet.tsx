'use client'

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

export function DraggableSheet({ children, className, dismissLabel, onDismiss }: { children: ReactNode; className: string; dismissLabel: string; onDismiss: () => void }) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const activePointer = useRef<number | null>(null)
  const dragged = useRef(false)

  const finish = (dismiss = false) => {
    if (activePointer.current === null) return
    activePointer.current = null
    setDragging(false)
    if (dismiss || offset > 72) onDismiss()
    else setOffset(0)
  }

  useEffect(() => {
    const cancel = () => finish(false)
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
    const nextOffset = Math.max(0, event.clientY - startY.current)
    if (nextOffset > 5) dragged.current = true
    setOffset(nextOffset)
  }

  const onPointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== event.pointerId) return
    const shouldDismiss = event.clientY - startY.current > 72
    finish(shouldDismiss)
  }

  return <div className={`${className} draggable-sheet${dragging ? ' is-dragging' : ''}`} style={{ transform: `translateY(${offset}px)` }}>
    <button
      className="sheet-drag-handle"
      type="button"
      aria-label={dismissLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={() => finish(false)}
      onLostPointerCapture={() => finish(false)}
      onClick={() => { if (!dragged.current) onDismiss(); dragged.current = false }}
    ><span aria-hidden="true" /></button>
    {children}
  </div>
}
