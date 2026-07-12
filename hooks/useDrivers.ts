import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Driver } from '@/types'

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const result = await db.getDrivers()
      setDrivers(result as unknown as Driver[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createDriver(data: Partial<Driver>) {
    const record = await db.createDriver(data)
    await load()
    return record
  }

  async function updateDriver(id: string, data: Partial<Driver>) {
    const record = await db.updateDriver(id, data)
    await load()
    return record
  }

  async function deleteDriver(id: string) {
    await db.deleteDriver(id)
    await load()
  }

  return { drivers, loading, error, createDriver, updateDriver, deleteDriver, reload: load }
}

export function useDriver(id: string) {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    db.getDriver(id)
      .then(r => setDriver(r as unknown as Driver))
      .finally(() => setLoading(false))
  }, [id])

  return { driver, loading }
}
