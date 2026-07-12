import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Payment } from '@/types'

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const result = await db.getPayments()
      setPayments(result as unknown as Payment[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createPayment(data: Partial<Payment>) {
    const record = await db.createPayment(data)
    await load()
    return record
  }

  async function updatePayment(id: string, data: Partial<Payment>) {
    const record = await db.updatePayment(id, data)
    await load()
    return record
  }

  async function deletePayment(id: string) {
    await db.deletePayment(id)
    await load()
  }

  return { payments, loading, error, createPayment, updatePayment, deletePayment, reload: load }
}

export function usePayment(id: string) {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    db.getPayment(id)
      .then(r => setPayment(r as unknown as Payment))
      .finally(() => setLoading(false))
  }, [id])

  return { payment, loading }
}
