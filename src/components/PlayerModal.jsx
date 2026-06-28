import { useState, useEffect } from 'react'
import { styles, getRatingColor } from '../utils'

export function PlayerModal({ player, onSave, onDelete, onClose, deleteConfirmId }) {
  const [name, setName] = useState(player?.name || '')
  const [number, setNumber] = useState(player?.number || '')
  const [gender, setGender] = useState(player?.gender || 'M')
  const [serve, setServe] = useState(player?.serve || 3)
  const [pass, setPass] = useState(player?.pass || 3)
  const [set, setSet] = useState(player?.set || 3)
  const [hit, setHit] = useState(player?.hit || 3)
  const [notes, setNotes] = useState(player?.notes || '')

  const overall = Math.round((serve + pass + set + hit) / 4)

  useEffect(() => {
    const sheet = document.getElementById('player-modal-sheet')
    if (!sheet) return

    function onResize() {
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height
        sheet.style.maxHeight = `${window.visualViewport.height - 20}px`
        sheet.style.paddingBottom = `${Math.max(keyboardHeight + 16, 48)}px`
      }
    }

    window.visualViewport?.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('scroll', onResize)
    return () => {
      window.visualViewport?.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('scroll', onResize)
    }
  }, [])

  const handleSave = () => onSave({ name, number, gender, overall, serve, pass, set, hit, notes })

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={player ? 'Edit player' : 'Add player'}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        id="player-modal-sheet"
        className="modal-sheet"
        style={{
          backgroundColor: styles.colors.surface,
          borderRadius: '20px 20px 0 0',
          padding: '0',
          paddingBottom: '48px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          border: `1px solid ${styles.colors.border}`,
          transition: 'max-height 0.15s ease, padding-bottom 0.15s ease',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: styles.colors.surface,
            padding: '16px',
            borderBottom: `1px solid ${styles.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{player ? 'Edit Player' : 'Add Player'}</h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: styles.colors.card,
              color: styles.colors.text,
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="player-name" style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Name</label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
              onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 400)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: styles.colors.card,
                border: `1px solid ${styles.colors.border}`,
                borderRadius: '8px',
                color: styles.colors.text,
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="player-number" style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Jersey #</label>
            <input
              id="player-number"
              type="text"
              inputMode="numeric"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Optional"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: styles.colors.card,
                border: `1px solid ${styles.colors.border}`,
                borderRadius: '8px',
                color: styles.colors.text,
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Gender</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['M', 'F'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: gender === g ? styles.colors.orange : styles.colors.card,
                    border: `1px solid ${gender === g ? styles.colors.orange : styles.colors.border}`,
                    borderRadius: '8px',
                    color: gender === g ? '#fff' : styles.colors.text,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {g === 'M' ? 'Boy' : 'Girl'}
                </button>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: styles.colors.muted }}>
            Skill Ratings
          </h3>

          {[
            { label: 'Serve', value: serve, setter: setServe },
            { label: 'Pass', value: pass, setter: setPass },
            { label: 'Set', value: set, setter: setSet },
            { label: 'Hit', value: hit, setter: setHit },
          ].map(({ label, value, setter }) => (
            <div key={label} style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{label}</span>
                <span style={{ color: getRatingColor(value), fontWeight: '600' }}>{value}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={value}
                onChange={(e) => setter(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: styles.colors.orange }}
              />
            </div>
          ))}

          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: styles.colors.card,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Overall Rating</span>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: getRatingColor(overall),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700',
              color: '#fff',
            }}>
              {overall}
            </span>
          </div>

          <div style={{ marginBottom: '24px', marginTop: '16px' }}>
            <label htmlFor="player-notes" style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Notes</label>
            <textarea
              id="player-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Strong server, shaky under pressure"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: styles.colors.card,
                border: `1px solid ${styles.colors.border}`,
                borderRadius: '8px',
                color: styles.colors.text,
                fontSize: '14px',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {player && (
              <button
                onClick={() => onDelete(player.id)}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: deleteConfirmId === player.id ? styles.colors.red : 'transparent',
                  border: `1px solid ${styles.colors.red}`,
                  borderRadius: '8px',
                  color: deleteConfirmId === player.id ? '#fff' : styles.colors.red,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {deleteConfirmId === player.id ? 'Tap again to confirm' : 'Delete'}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              style={{
                flex: player ? 1 : 'auto',
                width: player ? 'auto' : '100%',
                padding: '14px',
                backgroundColor: name.trim() ? styles.colors.orange : styles.colors.card,
                border: 'none',
                borderRadius: '8px',
                color: name.trim() ? '#fff' : styles.colors.muted,
                fontSize: '14px',
                fontWeight: '600',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {player ? 'Save Changes' : 'Add Player'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
