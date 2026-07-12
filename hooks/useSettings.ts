import { useEffect, useState } from 'react'
import { db } from '@/lib/db'

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.getSettings()
      .then(map => setSettings(map))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function setSetting(key: string, value: string) {
    await db.setSetting(key, value)
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return { settings, loading, setSetting }
}
