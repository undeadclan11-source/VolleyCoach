import { styles } from '../utils'

const positionLabels = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
const frontRow = [3, 2, 1]
const backRow = [4, 5, 0]

function getRatingColor(rating) {
  if (rating >= 4) return 'var(--vc-green)'
  if (rating >= 3) return 'var(--vc-orange)'
  return 'var(--vc-red)'
}

function Slot({ rotIndex, rotation, getPlayerById, interactive, onSlotClick, mode, selectedCourtIdx }) {
  const playerId = rotation[rotIndex]
  const player = playerId ? getPlayerById(playerId) : null
  const isServer = rotIndex === 0
  const isSelected = mode === 'ingame' && selectedCourtIdx === rotIndex

  let backgroundColor = player ? styles.colors.card : 'rgba(255,255,255,0.05)'
  let borderColor = isServer ? styles.colors.orange : styles.colors.border
  let borderWidth = isServer ? '2px' : '1px'

  if (isSelected) {
    backgroundColor = 'rgba(249, 115, 22, 0.1)'
    borderColor = styles.colors.orange
    borderWidth = '2px'
  }

  return (
    <button
      onClick={() => interactive && onSlotClick(rotIndex)}
      style={{
        flex: 1,
        aspectRatio: '1',
        backgroundColor,
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: interactive ? 'pointer' : 'default',
        padding: '10px',
        position: 'relative',
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: '10px', color: styles.colors.muted, position: 'absolute', top: '4px', left: '6px' }}>
        {positionLabels[rotIndex]}
      </span>
      {player ? (
        <>
          <span style={{ fontSize: '13px', fontWeight: '600', color: styles.colors.text }}>
            {player.name.split(' ')[0]}
          </span>
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: getRatingColor(player.overall),
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '700',
              color: '#fff',
              marginTop: '4px',
            }}
          >
            {player.overall}
          </span>
          {isServer && (
            <span style={{ fontSize: '9px', fontWeight: '700', color: styles.colors.orange, marginTop: '2px' }}>
              SERVING
            </span>
          )}
        </>
      ) : (
        <span style={{ fontSize: '20px', color: styles.colors.muted }}>+</span>
      )}
    </button>
  )
}

export function CourtDiagram({ rotation, getPlayerById, onSlotClick, interactive, mode, selectedCourtIdx }) {
  const slotProps = { rotation, getPlayerById, interactive, onSlotClick, mode, selectedCourtIdx }

  return (
    <div
      style={{
        backgroundColor: styles.colors.court,
        borderRadius: '12px',
        padding: '20px',
        border: `2px solid ${styles.colors.border}`,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontSize: '11px',
          color: styles.colors.muted,
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        ═══ NET ═══
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        {frontRow.map((i) => <Slot key={i} rotIndex={i} {...slotProps} />)}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {backRow.map((i) => <Slot key={i} rotIndex={i} {...slotProps} />)}
      </div>
    </div>
  )
}
