import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { LeasingOwner } from '@/types'

export function useLeasingOwners() {
  const [owners, setOwners] = useState<LeasingOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const result = await db.getLeasingOwners()
      setOwners(result as unknown as LeasingOwner[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createOwner(data: Partial<LeasingOwner>) {
    const record = await db.createLeasingOwner(data)
    await load()
    return record
  }

  async function updateOwner(id: string, data: Partial<LeasingOwner>) {
    const record = await db.updateLeasingOwner(id, data)
    await load()
    return record
  }

  async function deleteOwner(id: string) {
    await db.deleteLeasingOwner(id)
    await load()
  }

  return { owners, loading, error, createOwner, updateOwner, deleteOwner, reload: load }
}

export function useLeasingOwner(id: string) {
  const [owner, setOwner] = useState<LeasingOwner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    db.getLeasingOwner(id)
      .then(r => setOwner(r as unknown as LeasingOwner))
      .finally(() => setLoading(false))
  }, [id])

  return { owner, loading }
}
