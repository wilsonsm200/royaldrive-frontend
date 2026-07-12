import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Reservation } from '@/types'

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({})
  const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const [result, customers, vehicles] = await Promise.all([
        db.getReservations(),
        db.getCustomers(),
        db.getVehicles(),
      ])

      const cMap: Record<string, string> = {}
      customers.forEach((c: any) => { cMap[c.id] = c.name })

      const vMap: Record<string, string> = {}
      vehicles.forEach((v: any) => { vMap[v.id] = `${v.make} ${v.model} (${v.plate})` })

      setCustomerMap(cMap)
      setVehicleMap(vMap)
      setReservations(result as unknown as Reservation[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createReservation(data: Partial<Reservation>) {
    const record = await db.createReservation(data)
    await load()
    return record
  }

  async function updateReservation(id: string, data: Partial<Reservation>) {
    const record = await db.updateReservation(id, data)
    await load()
    return record
  }

  async function deleteReservation(id: string) {
    await db.deleteReservation(id)
    await load()
  }

  return { reservations, customerMap, vehicleMap, loading, error, createReservation, updateReservation, deleteReservation, reload: load }
}

export function useReservation(id: string) {
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({})
  const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      db.getReservation(id),
      db.getCustomers(),
      db.getVehicles(),
    ]).then(([r, customers, vehicles]) => {
      const cMap: Record<string, string> = {}
      customers.forEach((c: any) => { cMap[c.id] = c.name })
      const vMap: Record<string, string> = {}
      vehicles.forEach((v: any) => { vMap[v.id] = `${v.make} ${v.model} (${v.plate})` })
      setCustomerMap(cMap)
      setVehicleMap(vMap)
      setReservation(r as unknown as Reservation)
    }).finally(() => setLoading(false))
  }, [id])

  return { reservation, customerMap, vehicleMap, loading }
}
