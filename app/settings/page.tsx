'use client'
import { useEffect, useState } from 'react'
import { useSettings } from '@/hooks/useSettings'
import {
  Building2, Phone, Mail, MapPin,
  Target, DollarSign, FileText, Info,
  Settings, ChevronRight, Check, Loader2,
  AlertTriangle, Receipt
} from 'lucide-react'

const SECTIONS = [
  {
    id: 'business',
    label: 'Business Profile',
    icon: Building2,
    description: 'Appears on receipts and reports',
    fields: [
      { key: 'business_name', label: 'Business Name', placeholder: 'RoyalDrive Mobility', type: 'text', icon: Building2 },
      { key: 'business_phone', label: 'Phone Number', placeholder: '+254 700 000 000', type: 'text', icon: Phone },
      { key: 'business_email', label: 'Email Address', placeholder: 'info@royaldrive.co.ke', type: 'email', icon: Mail },
      { key: 'business_address', label: 'Address', placeholder: 'Nairobi, Kenya', type: 'text', icon: MapPin },
    ],
  },
  {
    id: 'finance',
    label: 'Finance Settings',
    icon: DollarSign,
    description: 'Controls dashboard revenue targets',
    fields: [
      { key: 'monthly_target', label: 'Monthly Revenue Target (KES)', placeholder: '500000', type: 'number', icon: Target },
      { key: 'currency', label: 'Currency', placeholder: 'KES', type: 'text', icon: DollarSign },
    ],
  },
  {
    id: 'receipt',
    label: 'Receipt Settings',
    icon: Receipt,
    description: 'Shown on printed receipts',
    fields: [
      { key: 'receipt_header', label: 'Receipt Header Text', placeholder: 'Thank you for choosing RoyalDrive!', type: 'text', icon: FileText },
      { key: 'receipt_footer', label: 'Receipt Footer Text', placeholder: 'Drive safe. See you again!', type: 'text', icon: FileText },
      { key: 'receipt_tel', label: 'Receipt Phone Number', placeholder: '+254 700 000 000', type: 'text', icon: Phone },
    ],
  },
  {
    id: 'system',
    label: 'System Info',
    icon: Settings,
    description: 'Read-only system information',
    fields: [
      { key: 'app_version', label: 'App Version', placeholder: '1.0.0', type: 'text', icon: Info },
    ],
  },
]

export default function SettingsPage() {
  const { settings, loading, setSetting } = useSettings()
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('business')

  useEffect(() => {
    if (!loading) setForm(settings)
  }, [loading, settings])

  async function handleSave(sectionId: string, fields: { key: string }[]) {
    setSaving(sectionId)
    for (const f of fields) {
      if (form[f.key] !== undefined) {
        await setSetting(f.key, form[f.key] || '')
      }
    }
    setSaving(null)
    setSaved(sectionId)
    setTimeout(() => setSaved(null), 2000)
  }

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={28} style={{ color: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Loading settings...</p>
        </div>
      </div>
    )
  }

  const activeData = SECTIONS.find(s => s.id === activeSection)!

  return (
    <div style={{
      background: '#f8fafc',
      minHeight: '100%',
      padding: '28px 28px',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      color: '#0f172a',
      boxSizing: 'border-box',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .settings-input:focus {
          border-color: #6366f1 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
          outline: none;
        }
        .settings-input { transition: all 0.15s ease; }
        .nav-btn:hover { background: #f1f5f9 !important; color: #6366f1 !important; }
        .save-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .save-btn { transition: all 0.15s ease; }
        .danger-btn:hover { background: #fee2e2 !important; }
        .danger-btn { transition: background 0.15s ease; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Settings size={18} color="#fff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>Settings</h1>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 0 46px' }}>
          Manage your business profile, finance targets and system preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Sidebar */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          animation: 'fadeUp 0.4s 0.05s ease both',
        }}>
          {SECTIONS.map(s => {
            const Icon = s.icon
            const isActive = activeSection === s.id
            return (
              <button
                key={s.id}
                className="nav-btn"
                onClick={() => setActiveSection(s.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none', borderRadius: '10px',
                  cursor: 'pointer', fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#f1f5f9' : 'transparent',
                  color: isActive ? '#6366f1' : '#475569',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '2px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '7px',
                    background: isActive ? 'rgba(99,102,241,0.12)' : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={14} color={isActive ? '#6366f1' : '#94a3b8'} />
                  </div>
                  <span>{s.label}</span>
                </div>
                {isActive && <ChevronRight size={14} color="#6366f1" />}
              </button>
            )
          })}
        </div>

        {/* Main Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            key={activeSection}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
              animation: 'fadeUp 0.3s ease both',
            }}
          >
            {/* Panel Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <activeData.icon size={20} color="#6366f1" />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                    {activeData.label}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
                    {activeData.description}
                  </p>
                </div>
              </div>

              {activeSection !== 'system' && (
                <button
                  className="save-btn"
                  onClick={() => handleSave(activeSection, activeData.fields)}
                  disabled={saving === activeSection}
                  style={{
                    padding: '9px 20px',
                    background: saved === activeSection
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', gap: '7px',
                    minWidth: '100px', justifyContent: 'center',
                  }}
                >
                  {saving === activeSection
                    ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving</>
                    : saved === activeSection
                    ? <><Check size={14} /> Saved</>
                    : 'Save Changes'
                  }
                </button>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '24px' }} />

            {/* Fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: activeData.fields.length > 2 ? '1fr 1fr' : '1fr',
              gap: '20px',
            }}>
              {activeData.fields.map(f => {
                const FieldIcon = f.icon
                return (
                  <div key={f.key}>
                    <label style={{
                      fontSize: '11px', fontWeight: 700,
                      color: '#64748b', textTransform: 'uppercase',
                      letterSpacing: '0.08em', display: 'block', marginBottom: '8px',
                    }}>
                      {f.label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: '12px', top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}>
                        <FieldIcon size={14} color="#94a3b8" />
                      </div>
                      {activeSection === 'system' ? (
                        <div style={{
                          width: '100%', padding: '10px 12px 10px 36px',
                          border: '1px solid #e2e8f0', borderRadius: '10px',
                          fontSize: '13px', color: '#94a3b8',
                          background: '#f8fafc',
                        }}>
                          {form[f.key] || f.placeholder}
                        </div>
                      ) : (
                        <input
                          className="settings-input"
                          type={f.type}
                          value={form[f.key] ?? ''}
                          placeholder={f.placeholder}
                          onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          style={{
                            width: '100%', padding: '10px 12px 10px 36px',
                            border: '1px solid #e2e8f0', borderRadius: '10px',
                            fontSize: '13px', color: '#1e293b',
                            background: '#f8fafc',
                            boxShadow: 'none',
                          }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Danger Zone */}
          {activeSection === 'system' && (
            <div style={{
              background: '#fff',
              border: '1px solid #fee2e2',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
              animation: 'fadeUp 0.35s 0.05s ease both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <AlertTriangle size={16} color="#dc2626" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626', margin: 0 }}>Danger Zone</h3>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px' }}>
                Irreversible actions. Proceed with caution.
              </p>
              <button
                className="danger-btn"
                style={{
                  padding: '9px 16px',
                  background: '#fff', color: '#dc2626',
                  border: '1px solid #fecaca', borderRadius: '10px',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <AlertTriangle size={13} />
                Clear All Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}