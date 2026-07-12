import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Customer } from '@/types'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const result = await db.getCustomers()
      setCustomers(result as unknown as Customer[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createCustomer(data: Partial<Customer>) {
    const record = await db.createCustomer(data)
    await load()
    return record
  }

  async function updateCustomer(id: string, data: Partial<Customer>) {
    const record = await db.updateCustomer(id, data)
    await load()
    return record
  }

  async function deleteCustomer(id: string) {
    await db.deleteCustomer(id)
    await load()
  }

  return { customers, loading, error, createCustomer, updateCustomer, deleteCustomer, reload: load }
}

export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    db.getCustomer(id)
      .then(r => setCustomer(r as unknown as Customer))
      .finally(() => setLoading(false))
  }, [id])

  return { customer, loading }
}
