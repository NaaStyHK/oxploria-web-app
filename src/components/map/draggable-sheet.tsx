'use client'

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

type SheetSnap = 'peek' | 'expanded'

type DraggableSheetProps = {
  children: ReactNode
  className: string
  dismissLabel: string
  onDismiss: () => void
  snap?: SheetSnap
  onSnapChange?: (snap: SheetSnap) => void
  peekHeight?: number
  expandLabel?: string
  collapseLabel?: string
}

export function DraggableSheet({ children, className, dismissLabel, onDismiss, snap, onSnapChange, peekHeight = 224, expandLabel, collapseLabel }: DraggableSheetProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const startOffset = useRef(0)
  const activePointer = useRef<number | null>(null)
  const dragged = useRef(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  const finish = (delta = 0, cancelled = false) => {
    if (activePointer.current === null) return
    activePointer.current = null
    setDragging(false)
    setOffset(0)
    if (cancelled) return
    if (!snap || !onSnapChange) {
      if (delta > 72) onDismiss()
      return
    }
    if (delta < -56) onSnapChange('expanded')
    else if (delta > 72) {
      if (snap === 'expanded') onSnapChange('peek')
      else onDismiss()
    }
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
    const height = sheetRef.current?.getBoundingClientRect().height ?? 0
    startOffset.current = snap === 'peek' ? Math.max(0, height - peekHeight) : 0
    dragged.current = false
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== event.pointerId) return
    const delta = event.clientY - startY.current
    const nextOffset = Math.max(0, startOffset.current + delta)
    if (Math.abs(delta) > 5) dragged.current = true
    setOffset(nextOffset)
  }

  const onPointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== event.pointerId) return
    finish(event.clientY - startY.current)
  }

  const restingTransform = snap === 'peek' ? `translateY(calc(100% - ${peekHeight}px))` : 'translateY(0)'
  const handleLabel = snap === 'peek' ? (expandLabel ?? dismissLabel) : snap === 'expanded' ? (collapseLabel ?? dismissLabel) : dismissLabel

  return <div ref={sheetRef} className={`${className} draggable-sheet${dragging ? ' is-dragging' : ''}`} style={{ transform: dragging ? `translateY(${offset}px)` : restingTransform }}>
    <button
      className="sheet-drag-handle"
      type="button"
      aria-label={handleLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={() => finish(0, true)}
      onLostPointerCapture={() => finish(0, true)}
      onClick={() => {
        if (!dragged.current) {
          if (snap && onSnapChange) onSnapChange(snap === 'peek' ? 'expanded' : 'peek')
          else onDismiss()
        }
        dragged.current = false
      }}
    ><span aria-hidden="true" /></button>
    {children}
  </div>
}
