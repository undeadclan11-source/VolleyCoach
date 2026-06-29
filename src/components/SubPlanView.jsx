import { styles, getRatingColor } from '../utils'

const positionLabels = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

export function SubPlanView({
  benchPlayers,
  presentPlayers,
  rotation,
  subPlan,
  game2StartPlan,
  setGame2StartPlan,
  onAssignSubPlan,
  getPlayerById,
}) {
  const requiredGame2Starters = Object.values(subPlan)
  const optionalFillers = presentPlayers.filter((p) => !requiredGame2Starters.includes(p.id))
  const selectedOptional = game2StartPlan.filter((id) => !requiredGame2Starters.includes(id))
  const totalFilled = requiredGame2Starters.length + selectedOptional.length

  const toggleOptionalPlayer = (playerId) => {
    if (selectedOptional.includes(playerId)) {
      setGame2StartPlan((prev) => prev.filter((id) => id !== playerId))
    } else if (totalFilled < 6) {
      setGame2StartPlan((prev) => [...prev, playerId])
    }
  }

  if (benchPlayers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: styles.colors.muted }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🪑</div>
        <p>No bench players — everyone&apos;s starting.</p>
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '1px',
          color: styles.colors.muted,
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        GAME 1 · SUB AT 13 POINTS
      </div>

      {benchPlayers.map((benchPlayer) => {
        const assignedIndex = Object.entries(subPlan).find(([, bpId]) => bpId === benchPlayer.id)?.[0]

        return (
          <div
            key={benchPlayer.id}
            style={{
              backgroundColor: styles.colors.card,
              border: `1px solid ${styles.colors.border}`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontWeight: '600' }}>{benchPlayer.name}</span>
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: getRatingColor(benchPlayer.overall),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#fff',
                }}
              >
                {benchPlayer.overall}
              </span>
              {assignedIndex !== undefined && (
                <span style={{ color: styles.colors.green, fontSize: '12px', marginLeft: 'auto' }}>✓ Set</span>
              )}
            </div>

            <div style={{ fontSize: '12px', color: styles.colors.muted, marginBottom: '8px' }}>Replaces:</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {rotation.map((playerId, index) => {
                if (!playerId) return null
                const starter = getPlayerById(playerId)
                if (!starter) return null
                const isAssigned = subPlan[index] === benchPlayer.id

                return (
                  <button
                    key={index}
                    onClick={() => onAssignSubPlan(benchPlayer.id, index)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: isAssigned ? styles.colors.green : styles.colors.surface,
                      border: `1px solid ${isAssigned ? styles.colors.green : styles.colors.border}`,
                      borderRadius: '4px',
                      color: isAssigned ? '#fff' : styles.colors.text,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {positionLabels[index]} {starter.name.split(' ')[0]}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div style={{ height: '1px', background: styles.colors.border, margin: '20px 0' }} />

      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '1px',
          color: styles.colors.muted,
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        GAME 2 · STARTING LINEUP
      </div>

      {requiredGame2Starters.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {requiredGame2Starters.map((playerId) => {
              const player = getPlayerById(playerId)
              if (!player) return null
              return (
                <div
                  key={playerId}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: `1px solid ${styles.colors.blue}`,
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: styles.colors.text }}>
                      🔒 {player.name.split(' ')[0]}
                    </span>
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
                  </div>
                  <span style={{ fontSize: '10px', color: styles.colors.blue, fontWeight: 600 }}>REQUIRED</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {optionalFillers.map((player) => {
          const isSelected = selectedOptional.includes(player.id)
          const canSelect = totalFilled < 6 || isSelected
          return (
            <button
              key={player.id}
              onClick={() => canSelect && toggleOptionalPlayer(player.id)}
              disabled={!canSelect}
              style={{
                padding: '8px 12px',
                backgroundColor: isSelected ? styles.colors.orange : styles.colors.card,
                border: `1px solid ${isSelected ? styles.colors.orange : styles.colors.border}`,
                borderRadius: '20px',
                color: isSelected ? '#fff' : styles.colors.text,
                fontSize: '13px',
                fontWeight: '500',
                cursor: canSelect ? 'pointer' : 'not-allowed',
                opacity: canSelect ? 1 : 0.5,
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
          )
        })}
      </div>

      <div
        style={{
          fontSize: '13px',
          color: totalFilled === 6 ? styles.colors.green : styles.colors.muted,
          marginBottom: '12px',
        }}
      >
        {totalFilled === 6 ? '✓ Game 2 lineup is set' : `${totalFilled} of 6 spots filled`}
      </div>

      <p style={{ fontSize: '12px', color: styles.colors.muted, fontStyle: 'italic' }}>
        Players subbed in during Game 1 are required to start Game 2 per league rules.
      </p>
    </div>
  )
}
