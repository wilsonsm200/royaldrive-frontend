import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { LeasingContract } from '@/types'

export function useLeasingContracts() {
  const [contracts, setContracts] = useState<LeasingContract[]>([])
  const [ownerMap, setOwnerMap] = useState<Record<string, string>>({})
  const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const [result, owners, vehicles] = await Promise.all([
        db.getLeasingContracts(),
        db.getLeasingOwners(),
        db.getVehicles(),
      ])

      const oMap: Record<string, string> = {}
      owners.forEach((o: any) => { oMap[o.id] = o.name })

      const vMap: Record<string, string> = {}
      vehicles.forEach((v: any) => { vMap[v.id] = `${v.make} ${v.model}` })

      setOwnerMap(oMap)
      setVehicleMap(vMap)
      setContracts(result as unknown as LeasingContract[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createContract(data: Partial<LeasingContract>) {
    const record = await db.createLeasingContract(data)
    await load()
    return record
  }

  async function updateContract(id: string, data: Partial<LeasingContract>) {
    const record = await db.updateLeasingContract(id, data)
    await load()
    return record
  }

  async function deleteContract(id: string) {
    await db.deleteLeasingContract(id)
    await load()
  }

  return { contracts, ownerMap, vehicleMap, loading, error, createContract, updateContract, deleteContract, reload: load }
}

export function useLeasingContract(id: string) {
  const [contract, setContract] = useState<LeasingContract | null>(null)
  const [ownerMap, setOwnerMap] = useState<Record<string, string>>({})
  const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      db.getLeasingContract(id),
      db.getLeasingOwners(),
      db.getVehicles(),
    ]).then(([c, owners, vehicles]) => {
      const oMap: Record<string, string> = {}
      owners.forEach((o: any) => { oMap[o.id] = o.name })
      const vMap: Record<string, string> = {}
      vehicles.forEach((v: any) => { vMap[v.id] = `${v.make} ${v.model}` })
      setOwnerMap(oMap)
      setVehicleMap(vMap)
      setContract(c as unknown as LeasingContract)
    }).finally(() => setLoading(false))
  }, [id])

  return { contract, ownerMap, vehicleMap, loading }
}
