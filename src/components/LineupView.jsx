import { styles, getRatingColor } from '../utils'
import { CourtDiagram } from './CourtDiagram'

export function LineupView({
  presentPlayers,
  benchPlayers,
  rotation,
  selectedBenchPlayer,
  onAutoSuggest,
  onCourtSlotClick,
  onBenchPlayerClick,
  getPlayerById,
}) {
  if (presentPlayers.length < 6) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${styles.colors.red}`,
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}
      >
        <span style={{ color: styles.colors.red, fontWeight: '600' }}>⚠️ Mark at least 6 players present first.</span>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={onAutoSuggest}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: 'transparent',
          border: `2px solid ${styles.colors.orange}`,
          borderRadius: '8px',
          color: styles.colors.orange,
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '16px',
        }}
      >
        ⚡ Auto-Suggest Best Lineup
      </button>

      <CourtDiagram rotation={rotation} getPlayerById={getPlayerById} onSlotClick={onCourtSlotClick} interactive />

      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: styles.colors.muted }}>
          Bench ({benchPlayers.length})
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {benchPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => onBenchPlayerClick(player.id)}
              style={{
                padding: '8px 12px',
                backgroundColor: selectedBenchPlayer === player.id ? styles.colors.orange : styles.colors.card,
                border: `1px solid ${selectedBenchPlayer === player.id ? styles.colors.orange : styles.colors.border}`,
                borderRadius: '20px',
                color: selectedBenchPlayer === player.id ? '#fff' : styles.colors.text,
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {player.name.split(' ')[0]}
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: getRatingColor(player.overall),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#fff',
                }}
              >
                {player.overall}
              </span>
            </button>
          ))}
          {benchPlayers.length === 0 && (
            <span style={{ color: styles.colors.muted, fontSize: '13px' }}>All players are on court</span>
          )}
        </div>
      </div>
    </div>
  )
}
