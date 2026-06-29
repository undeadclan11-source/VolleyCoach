import { useEffect } from 'react'
import { styles } from '../utils'

export function LateArrivalModal({ players, onMarkPresent, onClose }) {
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
          maxHeight: '60vh',
          overflow: 'auto',
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
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Late Arrival</h3>
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
        {players.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: styles.colors.muted }}>
            Everyone is already marked present!
          </div>
        ) : (
          <div style={{ padding: '8px' }}>
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => onMarkPresent(player.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: styles.colors.card,
                  border: `1px solid ${styles.colors.border}`,
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontWeight: '600', color: styles.colors.text }}>{player.name}</span>
                <span style={{ color: styles.colors.green, fontSize: '12px' }}>Mark Present</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
