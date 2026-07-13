// lib/db.ts - Database access (Supabase)
import { supabase } from './supabase'

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
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(mapCreated)
  },
  async getCustomer(id: string) {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single()
    if (error) throw error
    return mapCreated(data)
  },
  async createCustomer(data: any) {
    const { data: record, error } = await supabase.from('customers').insert(data).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async updateCustomer(id: string, data: any) {
    const { data: record, error } = await supabase.from('customers').update(data).eq('id', id).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async deleteCustomer(id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) throw error
  },

  // ---------- Vehicles ----------
  async getVehicles() {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(mapCreated)
  },
  async getVehicle(id: string) {
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single()
    if (error) throw error
    return mapCreated(data)
  },
  async createVehicle(data: any) {
    const { data: record, error } = await supabase.from('vehicles').insert(data).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async updateVehicle(id: string, data: any) {
    const { data: record, error } = await supabase.from('vehicles').update(data).eq('id', id).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async deleteVehicle(id: string) {
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) throw error
  },

  // ---------- Drivers ----------
  async getDrivers() {
    const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(mapCreated)
  },
  async getDriver(id: string) {
    const { data, error } = await supabase.from('drivers').select('*').eq('id', id).single()
    if (error) throw error
    return mapCreated(data)
  },
  async createDriver(data: any) {
    const { data: record, error } = await supabase.from('drivers').insert(data).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async updateDriver(id: string, data: any) {
    const { data: record, error } = await supabase.from('drivers').update(data).eq('id', id).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async deleteDriver(id: string) {
    const { error } = await supabase.from('drivers').delete().eq('id', id)
    if (error) throw error
  },

  // ---------- Reservations ----------
  async getReservations() {
    const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(mapReservation)
  },
  async getReservation(id: string) {
    const { data, error } = await supabase.from('reservations').select('*').eq('id', id).single()
    if (error) throw error
    return mapReservation(data)
  },
  async createReservation(data: any) {
    const { data: record, error } = await supabase.from('reservations').insert(unmapReservation(data)).select()
    if (error) throw error
    return mapReservation(record[0])
  },
  async updateReservation(id: string, data: any) {
    const { data: record, error } = await supabase.from('reservations').update(unmapReservation(data)).eq('id', id).select()
    if (error) throw error
    return mapReservation(record[0])
  },
  async deleteReservation(id: string) {
    const { error } = await supabase.from('reservations').delete().eq('id', id)
    if (error) throw error
  },

  // ---------- Leasing Contracts ----------
  async getLeasingContracts() {
    const { data, error } = await supabase.from('leasing_contracts').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(mapContract)
  },
  async getLeasingContract(id: string) {
    const { data, error } = await supabase.from('leasing_contracts').select('*').eq('id', id).single()
    if (error) throw error
    return mapContract(data)
  },
  async createLeasingContract(data: any) {
    const { data: record, error } = await supabase.from('leasing_contracts').insert(unmapContract(data)).select()
    if (error) throw error
    return mapContract(record[0])
  },
  async updateLeasingContract(id: string, data: any) {
    const { data: record, error } = await supabase.from('leasing_contracts').update(unmapContract(data)).eq('id', id).select()
    if (error) throw error
    return mapContract(record[0])
  },
  async deleteLeasingContract(id: string) {
    const { error } = await supabase.from('leasing_contracts').delete().eq('id', id)
    if (error) throw error
  },

  // ---------- Leasing Owners ----------
  async getLeasingOwners() {
    const { data, error } = await supabase.from('leasing_owners').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(mapCreated)
  },
  async getLeasingOwner(id: string) {
    const { data, error } = await supabase.from('leasing_owners').select('*').eq('id', id).single()
    if (error) throw error
    return mapCreated(data)
  },
  async createLeasingOwner(data: any) {
    const { data: record, error } = await supabase.from('leasing_owners').insert(data).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async updateLeasingOwner(id: string, data: any) {
    const { data: record, error } = await supabase.from('leasing_owners').update(data).eq('id', id).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async deleteLeasingOwner(id: string) {
    const { error } = await supabase.from('leasing_owners').delete().eq('id', id)
    if (error) throw error
  },

  // ---------- Payments ----------
  async getPayments(filter?: { category?: string }) {
    let query = supabase.from('payments').select('*').order('created_at', { ascending: false })
    if (filter?.category) query = query.eq('category', filter.category)
    const { data, error } = await query
    if (error) throw error
    return (data || []).map(mapCreated)
  },
  async getPayment(id: string) {
    const { data, error } = await supabase.from('payments').select('*').eq('id', id).single()
    if (error) throw error
    return mapCreated(data)
  },
  async createPayment(data: any) {
    const { data: record, error } = await supabase.from('payments').insert(data).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async updatePayment(id: string, data: any) {
    const { data: record, error } = await supabase.from('payments').update(data).eq('id', id).select()
    if (error) throw error
    return mapCreated(record[0])
  },
  async deletePayment(id: string) {
    const { error } = await supabase.from('payments').delete().eq('id', id)
    if (error) throw error
  },

  // ---------- Settings ----------
  async getSettings() {
    const { data, error } = await supabase.from('settings').select('*')
    if (error) throw error
    const map: Record<string, string> = {}
    ;(data || []).forEach((r: any) => { map[r.key] = r.value })
    return map
  },
  async setSetting(key: string, value: string) {
    const { data: existing } = await supabase.from('settings').select('id').eq('key', key).maybeSingle()
    if (existing) {
      const { error } = await supabase.from('settings').update({ value }).eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('settings').insert({ key, value })
      if (error) throw error
    }
  },
}
