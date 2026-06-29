import { useState } from 'react'
import { styles, getRatingColor } from '../utils'

export function RosterTab({ players, record, onAddPlayer, onEditPlayer, onResetRecord }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const sortedPlayers = [...players].sort((a, b) => b.overall - a.overall)

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', fontFamily: styles.fontFamilyDisplay, letterSpacing: '-0.02em' }}>
        Season Roster ({players.length})
      </h2>

      {sortedPlayers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: styles.colors.muted }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <p>No players yet</p>
          <p style={{ fontSize: '14px' }}>Tap + to add your first player</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => onEditPlayer(player)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: styles.colors.card,
                border: `1px solid ${styles.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: getRatingColor(player.overall),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {player.overall}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', color: styles.colors.text }}>{player.name}</span>
                  {player.number && (
                    <span style={{ color: styles.colors.muted, fontSize: '13px' }}>#{player.number}</span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: styles.colors.muted, marginTop: '2px' }}>
                  S:{player.serve} P:{player.pass} Set:{player.set} H:{player.hit}
                </div>
                {player.notes && (
                  <div style={{ fontSize: '11px', color: styles.colors.muted, fontStyle: 'italic', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {player.notes}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {(players.length > 0 || record?.wins > 0 || record?.losses > 0) && (
      <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '80px' }}>
        <button
          onClick={() => {
            if (confirmReset) {
              onResetRecord()
              setConfirmReset(false)
            } else {
              setConfirmReset(true)
              setTimeout(() => setConfirmReset(false), 3000)
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: confirmReset ? styles.colors.red : styles.colors.muted,
            fontSize: '13px',
            cursor: 'pointer',
            fontWeight: confirmReset ? 700 : 400,
          }}
        >
          {confirmReset ? 'Tap again to confirm reset' : 'Reset season record'}
        </button>
      </div>
      )}

      <button
        onClick={onAddPlayer}
        aria-label="Add player"
        className="fab"
        style={{
          position: 'fixed',
          bottom: '88px',
          right: 'calc(max(0px, (100vw - 480px) / 2) + 16px)',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: styles.colors.orange,
          border: 'none',
          color: '#fff',
          fontSize: '28px',
          fontWeight: '300',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        +
      </button>
    </div>
  )
}
