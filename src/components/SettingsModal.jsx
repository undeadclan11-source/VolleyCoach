import { useEffect } from 'react'
import { styles } from '../utils'

export function SettingsModal({ settings, onChange, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: styles.colors.surface,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: `1px solid ${styles.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Settings</h3>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: styles.colors.card,
              color: styles.colors.text,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '13px', lineHeight: 1.4 }}>
              Require fair subs in the 3rd (deciding) set
              <div style={{ fontSize: '11px', color: styles.colors.muted, marginTop: '4px' }}>
                Off by default — most rec leagues play the 3rd set to win, no mandatory subs.
              </div>
            </span>
            {/* custom toggle */}
            <button
              role="switch"
              aria-checked={settings.thirdSetRequiresSubs}
              onClick={() => onChange({ ...settings, thirdSetRequiresSubs: !settings.thirdSetRequiresSubs })}
              style={{
                flexShrink: 0,
                marginTop: '2px',
                width: '44px',
                height: '24px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                backgroundColor: settings.thirdSetRequiresSubs ? styles.colors.orange : styles.colors.border,
                transition: 'background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: settings.thirdSetRequiresSubs ? 'flex-end' : 'flex-start',
              }}
            >
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  display: 'block',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </button>
          </label>
        </div>
      </div>
    </div>
  )
}
