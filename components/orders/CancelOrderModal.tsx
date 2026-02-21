'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const CANCEL_OPTIONS = [
  'No recibimos el pago — Por favor realizá la transferencia correctamente en tu próximo pedido',
  'Problema con el envío — Devolveremos el monto abonado a la brevedad, disculpá la molestia',
  'Producto sin stock — El artículo solicitado no está disponible en este momento',
  'Datos de entrega incorrectos — No pudimos contactarte para coordinar el envío',
  'Pedido duplicado — Ya procesamos un pedido igual para vos, este será cancelado',
  'Otro motivo',
]

const OTHER_IDX = CANCEL_OPTIONS.length - 1

interface Props {
  isOpen: boolean
  orderId: string
  onConfirm: (reason: string) => void
  onClose: () => void
}

export default function CancelOrderModal({ isOpen, orderId, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [customReason, setCustomReason] = useState('')

  if (!isOpen) return null

  const isOtherSelected = selected === OTHER_IDX
  const canConfirm = selected !== null && !(isOtherSelected && customReason.trim().length === 0)

  const handleConfirm = () => {
    if (!canConfirm) return
    const reason = isOtherSelected ? customReason.trim() : CANCEL_OPTIONS[selected!]
    onConfirm(reason)
    resetState()
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const resetState = () => {
    setSelected(null)
    setCustomReason('')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cancelar pedido</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Seleccioná el motivo — se enviará al cliente por email
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-2">
          {CANCEL_OPTIONS.map((option, idx) => (
            <label
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selected === idx
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`cancel-reason-${orderId}`}
                checked={selected === idx}
                onChange={() => setSelected(idx)}
                className="mt-0.5 flex-shrink-0 accent-red-500"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}

          {isOtherSelected && (
            <div className="mt-1">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value.slice(0, 200))}
                placeholder="Describí el motivo de la cancelación..."
                rows={3}
                maxLength={200}
                autoFocus
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none transition"
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {customReason.length}/200
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar pedido
          </button>
        </div>
      </div>
    </div>
  )
}
