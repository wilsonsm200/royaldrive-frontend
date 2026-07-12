import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Using fallback to PocketBase.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions to maintain compatibility with PocketBase hooks
export async function supabaseQuery(table: string, options?: any) {
  let query = supabase.from(table).select('*')
  
  if (options?.sort) {
    const [field, order] = options.sort.split('-')
    query = query.order(field, { ascending: order === 'asc' })
  }
  
  if (options?.filter) {
    query = query.match(JSON.parse(options.filter))
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}
