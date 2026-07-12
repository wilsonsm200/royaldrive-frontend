export type Customer = {
  id: string
  name: string
  phone: string
  email: string
  location: string
  notes: string
  created: string
  updated: string
}

export type Vehicle = {
  id: string
  make: string
  model: string
  year: number
  plate: string
  status: 'Available' | 'On Trip' | 'In Service' | 'Leased'
  daily_rate: number
  color?: string
  seats?: number
  notes: string
  created: string
  updated: string
}

export type Driver = {
  id: string
  name: string
  phone: string
  license_number: string
  license_expiry: string
  availability: 'Available' | 'On Trip' | 'Off Duty'
  notes: string
  created: string
  updated: string
}

export type Reservation = {
  date?: string
  time?: string
  expand?: { customer?: { name?: string; phone?: string }; vehicle?: { make?: string; model?: string; plate?: string }; driver?: { name?: string } }
  id: string
  customer: string
  service_type: 'Airport Transfer' | 'Chauffeur' | 'Self-Drive' | 'Wedding' | 'Long Distance'
  pickup_location: string
  destination: string
  pickup_date: string
  pickup_time: string
  vehicle: string
  driver: string
  amount: number
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled'
  notes: string
  created: string
  updated: string
}

export type LeasingOwner = {
  id: string
  name: string
  phone: string
  email: string
  id_number: string
  notes: string
  created: string
  updated: string
}

export type LeasingContract = {
  expand?: { owner?: { name?: string; phone?: string; email?: string }; vehicle?: { make?: string; model?: string; plate?: string } }
  id: string
  owner: string
  vehicle: string
  start_date: string
  payout_frequency: 'Weekly' | 'Monthly'
  payout_amount: number
  status: 'Active' | 'Ended'
  notes: string
  created: string
  updated: string
}

export type Payment = {
  id: string
  category: 'Reservation' | 'Leasing Payout' | 'Car Sale' | 'Other'
  reference_id: string
  amount: number
  method: 'Mpesa' | 'Cash' | 'Bank Transfer'
  status: 'paid' | 'Paid' | 'pending' | 'Pending' | 'partial' | 'Partial' | 'overdue' | 'Overdue'
  payment_date: string
  notes: string
  created: string
  updated: string
}