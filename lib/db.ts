// lib/db.ts - Unified database access (supports both PocketBase and Supabase)
import { supabase } from './supabase'
import pb from './pocketbase'

const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'

// ---------- Field mapping helpers (Supabase columns -> PocketBase-style names) ----------
function mapReservation(row: any) {
  if (!row) return row
  return {
    ...row,
    customer: row.customer_id,
    vehicle: row.vehicle_id,
    driver: row.driver_id,
    created: row.created_at,
    date: row.pickup_date,
    time: row.pickup_time,
  }
}
function unmapReservation(data: any) {
  const out = { ...data }
  if ('customer' in out) { out.customer_id = out.customer; delete out.customer }
  if ('vehicle' in out) { out.vehicle_id = out.vehicle; delete out.vehicle }
  if ('driver' in out) { out.driver_id = out.driver; delete out.driver }
  if ('date' in out) { out.pickup_date = out.date; delete out.date }
  if ('time' in out) { out.pickup_time = out.time; delete out.time }
  return out
}
function mapContract(row: any) {
  if (!row) return row
  return { ...row, owner: row.owner_id, vehicle: row.vehicle_id, created: row.created_at }
}
function unmapContract(data: any) {
  const out = { ...data }
  if ('owner' in out) { out.owner_id = out.owner; delete out.owner }
  if ('vehicle' in out) { out.vehicle_id = out.vehicle; delete out.vehicle }
  return out
}
function mapCreated(row: any) {
  if (!row) return row
  return { ...row, created: row.created_at }
}

export const db = {
  // ---------- Customers ----------
  async getCustomers() {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(mapCreated)
    }
    return await pb.collection('customers').getFullList({ sort: '-created' })
  },
  async getCustomer(id: string) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single()
      if (error) throw error
      return mapCreated(data)
    }
    return await pb.collection('customers').getOne(id)
  },
  async createCustomer(data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('customers').insert(data).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('customers').create(data)
  },
  async updateCustomer(id: string, data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('customers').update(data).eq('id', id).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('customers').update(id, data)
  },
  async deleteCustomer(id: string) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('customers').delete().eq('id', id)
      if (error) throw error
      return
    }
    return await pb.collection('customers').delete(id)
  },

  // ---------- Vehicles ----------
  async getVehicles() {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(mapCreated)
    }
    return await pb.collection('vehicles').getFullList({ sort: '-created' })
  },
  async getVehicle(id: string) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single()
      if (error) throw error
      return mapCreated(data)
    }
    return await pb.collection('vehicles').getOne(id)
  },
  async createVehicle(data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('vehicles').insert(data).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('vehicles').create(data)
  },
  async updateVehicle(id: string, data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('vehicles').update(data).eq('id', id).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('vehicles').update(id, data)
  },
  async deleteVehicle(id: string) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('vehicles').delete().eq('id', id)
      if (error) throw error
      return
    }
    return await pb.collection('vehicles').delete(id)
  },

  // ---------- Drivers ----------
  async getDrivers() {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(mapCreated)
    }
    return await pb.collection('drivers').getFullList({ sort: '-created' })
  },
  async getDriver(id: string) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('drivers').select('*').eq('id', id).single()
      if (error) throw error
      return mapCreated(data)
    }
    return await pb.collection('drivers').getOne(id)
  },
  async createDriver(data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('drivers').insert(data).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('drivers').create(data)
  },
  async updateDriver(id: string, data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('drivers').update(data).eq('id', id).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('drivers').update(id, data)
  },
  async deleteDriver(id: string) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('drivers').delete().eq('id', id)
      if (error) throw error
      return
    }
    return await pb.collection('drivers').delete(id)
  },

  // ---------- Reservations ----------
  async getReservations() {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(mapReservation)
    }
    return await pb.collection('reservations').getFullList({ sort: '-created', expand: 'customer,vehicle,driver' })
  },
  async getReservation(id: string) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('reservations').select('*').eq('id', id).single()
      if (error) throw error
      return mapReservation(data)
    }
    return await pb.collection('reservations').getOne(id, { expand: 'customer,vehicle,driver' })
  },
  async createReservation(data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('reservations').insert(unmapReservation(data)).select()
      if (error) throw error
      return mapReservation(record[0])
    }
    return await pb.collection('reservations').create(data)
  },
  async updateReservation(id: string, data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('reservations').update(unmapReservation(data)).eq('id', id).select()
      if (error) throw error
      return mapReservation(record[0])
    }
    return await pb.collection('reservations').update(id, data)
  },
  async deleteReservation(id: string) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('reservations').delete().eq('id', id)
      if (error) throw error
      return
    }
    return await pb.collection('reservations').delete(id)
  },

  // ---------- Leasing Contracts ----------
  async getLeasingContracts() {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('leasing_contracts').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(mapContract)
    }
    return await pb.collection('leasing_contracts').getFullList({ sort: '-created' })
  },
  async getLeasingContract(id: string) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('leasing_contracts').select('*').eq('id', id).single()
      if (error) throw error
      return mapContract(data)
    }
    return await pb.collection('leasing_contracts').getOne(id)
  },
  async createLeasingContract(data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('leasing_contracts').insert(unmapContract(data)).select()
      if (error) throw error
      return mapContract(record[0])
    }
    return await pb.collection('leasing_contracts').create(data)
  },
  async updateLeasingContract(id: string, data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('leasing_contracts').update(unmapContract(data)).eq('id', id).select()
      if (error) throw error
      return mapContract(record[0])
    }
    return await pb.collection('leasing_contracts').update(id, data)
  },
  async deleteLeasingContract(id: string) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('leasing_contracts').delete().eq('id', id)
      if (error) throw error
      return
    }
    return await pb.collection('leasing_contracts').delete(id)
  },

  // ---------- Leasing Owners ----------
  async getLeasingOwners() {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('leasing_owners').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(mapCreated)
    }
    return await pb.collection('leasing_owners').getFullList()
  },
  async getLeasingOwner(id: string) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('leasing_owners').select('*').eq('id', id).single()
      if (error) throw error
      return mapCreated(data)
    }
    return await pb.collection('leasing_owners').getOne(id)
  },
  async createLeasingOwner(data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('leasing_owners').insert(data).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('leasing_owners').create(data)
  },
  async updateLeasingOwner(id: string, data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('leasing_owners').update(data).eq('id', id).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('leasing_owners').update(id, data)
  },
  async deleteLeasingOwner(id: string) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('leasing_owners').delete().eq('id', id)
      if (error) throw error
      return
    }
    return await pb.collection('leasing_owners').delete(id)
  },

  // ---------- Payments ----------
  async getPayments(filter?: { category?: string }) {
    if (USE_SUPABASE) {
      let query = supabase.from('payments').select('*').order('created_at', { ascending: false })
      if (filter?.category) query = query.eq('category', filter.category)
      const { data, error } = await query
      if (error) throw error
      return (data || []).map(mapCreated)
    }
    let pbFilter: any = undefined
    if (filter?.category) pbFilter = { filter: `category='${filter.category}'` }
    return await pb.collection('payments').getFullList(pbFilter)
  },
  async getPayment(id: string) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('payments').select('*').eq('id', id).single()
      if (error) throw error
      return mapCreated(data)
    }
    return await pb.collection('payments').getOne(id)
  },
  async createPayment(data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('payments').insert(data).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('payments').create(data)
  },
  async updatePayment(id: string, data: any) {
    if (USE_SUPABASE) {
      const { data: record, error } = await supabase.from('payments').update(data).eq('id', id).select()
      if (error) throw error
      return mapCreated(record[0])
    }
    return await pb.collection('payments').update(id, data)
  },
  async deletePayment(id: string) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('payments').delete().eq('id', id)
      if (error) throw error
      return
    }
    return await pb.collection('payments').delete(id)
  },

  // ---------- Settings ----------
  async getSettings() {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error
      const map: Record<string, string> = {}
      ;(data || []).forEach((r: any) => { map[r.key] = r.value })
      return map
    }
    const records = await pb.collection('settings').getFullList()
    const map: Record<string, string> = {}
    records.forEach((r: any) => { map[r.key] = r.value })
    return map
  },
  async setSetting(key: string, value: string) {
    if (USE_SUPABASE) {
      const { data: existing } = await supabase.from('settings').select('id').eq('key', key).maybeSingle()
      if (existing) {
        const { error } = await supabase.from('settings').update({ value }).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('settings').insert({ key, value })
        if (error) throw error
      }
      return
    }
    try {
      const existing = await pb.collection('settings').getFirstListItem(`key="${key}"`)
      await pb.collection('settings').update(existing.id, { value })
    } catch {
      await pb.collection('settings').create({ key, value })
    }
  },
}
