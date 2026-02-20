'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePendingOrders(initialCount: number) {
  const [pendingCount, setPendingCount] = useState(initialCount)
  const supabase = createClient()

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (count !== null) setPendingCount(count)
    }

    fetchCount()

    const channel = supabase
      .channel('pending-orders-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')

          if (count !== null) {
            setPendingCount(count)

            if (
              payload.eventType === 'INSERT' &&
              (payload.new as { status?: string })?.status === 'pending'
            ) {
              window.dispatchEvent(
                new CustomEvent('new-order-arrived', {
                  detail: {
                    customerName: (payload.new as { customer_name?: string })?.customer_name,
                    total: (payload.new as { total?: number })?.total,
                  },
                })
              )
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return pendingCount
}
