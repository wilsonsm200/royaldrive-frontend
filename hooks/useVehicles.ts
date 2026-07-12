import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Vehicle } from '@/types'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const result = await db.getVehicles()
      setVehicles(result as unknown as Vehicle[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createVehicle(data: Partial<Vehicle>) {
    const record = await db.createVehicle(data)
    await load()
    return record
  }

  async function updateVehicle(id: string, data: Partial<Vehicle>) {
    const record = await db.updateVehicle(id, data)
    await load()
    return record
  }

  async function deleteVehicle(id: string) {
    await db.deleteVehicle(id)
    await load()
  }

  return { vehicles, loading, error, createVehicle, updateVehicle, deleteVehicle, reload: load }
}

export function useVehicle(id: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const r = await db.getVehicle(id)
      setVehicle(r as unknown as Vehicle)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function updateVehicle(data: Partial<Vehicle>) {
    const record = await db.updateVehicle(id, data)
    setVehicle(record as unknown as Vehicle)
    return record
  }

  return { vehicle, loading, updateVehicle, reload: load }
}
