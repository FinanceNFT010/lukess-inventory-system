'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { usePendingOrders } from '@/lib/hooks/usePendingOrders'

interface Props {
  initialCount: number
}

export function PendingOrdersBadge({ initialCount }: Props) {
  const pendingCount = usePendingOrders(initialCount)

  useEffect(() => {
    const handleNewOrder = (e: Event) => {
      const { customerName, total } = (e as CustomEvent<{ customerName: string; total: number }>).detail
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'}
              max-w-sm w-full bg-white shadow-lg rounded-2xl pointer-events-auto
              flex items-start gap-3 p-4 border border-blue-100`}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🛍️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">¡Nuevo pedido online!</p>
              <p className="text-sm text-gray-600 truncate">
                {customerName} · Bs {Number(total).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        ),
        { duration: 6000, position: 'top-right' }
      )
    }

    window.addEventListener('new-order-arrived', handleNewOrder)
    return () => window.removeEventListener('new-order-arrived', handleNewOrder)
  }, [])

  if (pendingCount === 0) return null

  return (
    <span
      className="
        absolute -top-1 -right-1
        min-w-[20px] h-5
        bg-red-500 text-white
        text-xs font-bold
        rounded-full
        flex items-center justify-center
        px-1.5
        shadow-md
        animate-pulse
        z-10
      "
    >
      {pendingCount > 99 ? '99+' : pendingCount}
    </span>
  )
}
