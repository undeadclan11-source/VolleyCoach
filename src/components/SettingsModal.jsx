import { styles } from '../utils'

export function SettingsModal({ settings, onChange, onClose }) {
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
            <input
              type="checkbox"
              checked={settings.thirdSetRequiresSubs}
              onChange={(e) => onChange({ ...settings, thirdSetRequiresSubs: e.target.checked })}
              style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px', accentColor: styles.colors.orange }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
