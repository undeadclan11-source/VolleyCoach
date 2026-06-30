import { useState } from 'react'
import { styles, getRatingColor } from '../utils'
import { getSetTargetScore } from '../utils/scoring'
import { CourtDiagram } from './CourtDiagram'
import { ScoreColumn } from './ScoreColumn'

export function InGameTab({
  score,
  currentGame,
  rotation,
  setRotation,
  benchPlayers,
  subPlan,
  setSubPlan,
  plannedSubPlan,
  subsExecuted,
  alertDismissed,
  shouldShowSubAlert,
  subAlertThreshold,
  gameWonBy,
  emergencySubOut,
  emergencySubIn,
  onUpdateScore,
  onRotate,
  onExecuteSub,
  onDismissAlert,
  onReshowAlert,
  onSetEmergencySubOut,
  onSetEmergencySubIn,
  onMakeEmergencySub,
  onStartNextGame,
  onResetGame,
  onLogWin,
  onLogLoss,
  record,
  getPlayerById,
  isLineupComplete,
}) {
  const winningScore = getSetTargetScore(currentGame)

  const [selectedCourtIdx, setSelectedCourtIdx] = useState(null)
  const [selectedBenchId, setSelectedBenchId] = useState(null)
  const [subPlanNote, setSubPlanNote] = useState(null)
  const [loggedResult, setLoggedResult] = useState(null)
  const hasPendingSubs = Object.keys(plannedSubPlan).some((key) => !subsExecuted[key])

  const handleCourtSlotTap = (index) => {
    const playerId = rotation[index]

    if (selectedBenchId) {
      setRotation((prev) => {
        const next = [...prev]
        next[index] = selectedBenchId
        return next
      })
      const staleKeys = Object.keys(subPlan).filter((key) => Number(key) === index || subPlan[key] === selectedBenchId)
      if (staleKeys.length > 0) {
        setSubPlan((prev) => {
          const next = { ...prev }
          staleKeys.forEach((key) => delete next[key])
          return next
        })
        setSubPlanNote('Sub plan updated to match where you placed them.')
        setTimeout(() => setSubPlanNote(null), 3000)
      }
      setSelectedBenchId(null)
      setSelectedCourtIdx(null)
      return
    }

    if (selectedCourtIdx !== null) {
      if (selectedCourtIdx === index) {
        setSelectedCourtIdx(null)
      } else {
        setRotation((prev) => {
          const next = [...prev]
          const temp = next[index]
          next[index] = next[selectedCourtIdx]
          next[selectedCourtIdx] = temp
          return next
        })
        if (subPlan[index] || subPlan[selectedCourtIdx]) {
          setSubPlan((prev) => {
            const next = { ...prev }
            if (next[index]) delete next[index]
            if (next[selectedCourtIdx]) delete next[selectedCourtIdx]
            return next
          })
          setSubPlanNote('Sub plan updated — planned sub removed for swapped positions.')
          setTimeout(() => setSubPlanNote(null), 3000)
        }
        setSelectedCourtIdx(null)
      }
      return
    }

    if (playerId) setSelectedCourtIdx(index)
  }

  const handleBenchTap = (playerId) => {
    if (selectedBenchId === playerId) {
      setSelectedBenchId(null)
      return
    }
    if (selectedCourtIdx !== null) {
      setRotation((prev) => {
        const next = [...prev]
        next[selectedCourtIdx] = playerId
        return next
      })
      const staleKeys = Object.keys(subPlan).filter(
        (key) => Number(key) === selectedCourtIdx || subPlan[key] === playerId
      )
      if (staleKeys.length > 0) {
        setSubPlan((prev) => {
          const next = { ...prev }
          staleKeys.forEach((key) => delete next[key])
          return next
        })
        setSubPlanNote('Sub plan updated to match where you placed them.')
        setTimeout(() => setSubPlanNote(null), 3000)
      }
      setSelectedCourtIdx(null)
      setSelectedBenchId(null)
      return
    }
    setSelectedBenchId(playerId)
  }

  const getInstructionLabel = () => {
    if (selectedCourtIdx !== null) return 'Tap another position to swap, or tap a bench player'
    if (selectedBenchId !== null) return 'Tap a court position to sub them in'
    return null
  }

  if (!isLineupComplete) {
    return (
      <div style={{ padding: '16px' }}>
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${styles.colors.red}`,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <span style={{ color: styles.colors.red, fontWeight: '600' }}>
            ⚠️ Complete your lineup in Game Day tab first.
          </span>
        </div>
      </div>
    )
  }

  const instructionLabel = getInstructionLabel()

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '8px' }}>
        <ScoreColumn
          team="US"
          score={score.us}
          onIncrement={() => onUpdateScore('us', 1)}
          onDecrement={() => onUpdateScore('us', -1)}
          color={styles.colors.green}
        />
        <ScoreColumn
          team="THEM"
          score={score.them}
          onIncrement={() => onUpdateScore('them', 1)}
          onDecrement={() => onUpdateScore('them', -1)}
          color={styles.colors.red}
        />
      </div>

      <div style={{ textAlign: 'center', fontSize: '12px', color: styles.colors.muted, marginBottom: '16px' }}>
        GAME {currentGame} OF 3 · RALLY SCORING · {winningScore} PTS
      </div>

      {gameWonBy && (
        <div
          style={{
            backgroundColor: gameWonBy === 'us' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${gameWonBy === 'us' ? styles.colors.green : styles.colors.red}`,
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: gameWonBy === 'us' ? styles.colors.green : styles.colors.red,
            }}
          >
            {gameWonBy === 'us' ? '🏆 GAME WON — US!' : 'GAME LOST'}
          </span>
        </div>
      )}

      {!gameWonBy && (score.us >= winningScore || score.them >= winningScore) && (
        <div
          style={{
            backgroundColor: 'rgba(251, 191, 36, 0.12)',
            border: `1px solid ${styles.colors.yellow}`,
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
            marginBottom: '16px',
            color: styles.colors.yellow,
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          Win by 2 - keep scoring until one team leads by two.
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => {
            onLogWin()
            setLoggedResult('win')
          }}
          disabled={loggedResult !== null}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #22C55E44',
            background: loggedResult ? styles.colors.surface : '#22C55E22',
            color: loggedResult ? styles.colors.muted : '#22C55E',
            fontWeight: 800,
            fontSize: '14px',
            cursor: loggedResult ? 'not-allowed' : 'pointer',
          }}
        >
          ✓ Log Win
        </button>
        <button
          onClick={() => {
            onLogLoss()
            setLoggedResult('loss')
          }}
          disabled={loggedResult !== null}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #EF444444',
            background: loggedResult ? styles.colors.surface : '#EF444422',
            color: loggedResult ? styles.colors.muted : '#EF4444',
            fontWeight: 800,
            fontSize: '14px',
            cursor: loggedResult ? 'not-allowed' : 'pointer',
          }}
        >
          ✗ Log Loss
        </button>
      </div>

      {loggedResult && (
        <div
          style={{
            fontSize: '13px',
            color: loggedResult === 'win' ? styles.colors.green : styles.colors.red,
            textAlign: 'center',
            fontWeight: 700,
            marginTop: '-8px',
            marginBottom: '16px',
          }}
        >
          {loggedResult === 'win' ? 'Win logged.' : 'Loss logged.'} Season record: {record.wins}W - {record.losses}L
        </div>
      )}

      {shouldShowSubAlert && (
        <div
          className="sub-alert"
          role="alert"
          style={{
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            border: `1px solid ${styles.colors.yellow}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontWeight: '700', color: styles.colors.yellow, marginBottom: '8px' }}>
            ⚠️ {subAlertThreshold}-POINT MARK — {currentGame === 3 ? 'GAME 3 ' : ''}SUB TIME
          </div>
          {Object.entries(plannedSubPlan).map(([rotIndex, benchPlayerId]) => {
            if (subsExecuted[rotIndex]) return null
            const incoming = getPlayerById(benchPlayerId)
            const outgoing = getPlayerById(rotation[rotIndex])
            if (!incoming || !outgoing) return null

            return (
              <div
                key={rotIndex}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderTop: `1px solid ${styles.colors.border}`,
                }}
              >
                <span style={{ fontSize: '13px' }}>
                  {incoming.name} in for {outgoing.name} (P{parseInt(rotIndex) + 1})
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => {
                      setSelectedBenchId(incoming.id)
                      setSelectedCourtIdx(null)
                      onDismissAlert()
                    }}
                    title="Pick a different court spot for this sub"
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'transparent',
                      border: `1px solid ${styles.colors.border}`,
                      borderRadius: '4px',
                      color: styles.colors.muted,
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Change spot
                  </button>
                  <button
                    onClick={() => onExecuteSub(parseInt(rotIndex), benchPlayerId)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: styles.colors.green,
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )
          })}
          <button
            onClick={onDismissAlert}
            style={{
              marginTop: '8px',
              background: 'none',
              border: 'none',
              color: styles.colors.muted,
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {alertDismissed && hasPendingSubs && (
        <button
          onClick={onReshowAlert}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: styles.colors.card,
            border: `1px solid ${styles.colors.yellow}`,
            borderRadius: '6px',
            color: styles.colors.yellow,
            fontSize: '12px',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          ↩ Re-show Sub Alert
        </button>
      )}

      {instructionLabel && (
        <div style={{ fontSize: '12px', color: styles.colors.blue, textAlign: 'center', marginBottom: '8px' }}>
          {instructionLabel}
        </div>
      )}

      <CourtDiagram
        rotation={rotation}
        getPlayerById={getPlayerById}
        onSlotClick={handleCourtSlotTap}
        interactive
        mode="ingame"
        selectedCourtIdx={selectedCourtIdx}
        selectedBenchId={selectedBenchId}
      />

      {subPlanNote && (
        <div style={{ fontSize: '12px', color: styles.colors.yellow, textAlign: 'center', marginTop: '8px' }}>
          {subPlanNote}
        </div>
      )}

      <button
        onClick={onRotate}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: styles.colors.orange,
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer',
          marginTop: '16px',
        }}
      >
        🔄 Rotate — We Won Serve
      </button>

      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: styles.colors.muted }}>
          On Bench ({benchPlayers.length})
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {benchPlayers.map((player) => {
            const isSelected = selectedBenchId === player.id
            return (
              <button
                key={player.id}
                onClick={() => handleBenchTap(player.id)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.15)' : styles.colors.card,
                  border: `1px solid ${isSelected ? styles.colors.orange : styles.colors.border}`,
                  borderRadius: '20px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: styles.colors.text,
                }}
              >
                {player.name.split(' ')[0]}
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: getRatingColor(player.overall),
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: '700',
                    color: '#fff',
                  }}
                >
                  {player.overall}
                </span>
              </button>
            )
          })}
          {benchPlayers.length === 0 && <span style={{ color: styles.colors.muted, fontSize: '12px' }}>Empty</span>}
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          backgroundColor: styles.colors.card,
          border: `1px solid ${styles.colors.border}`,
          borderRadius: '8px',
          padding: '12px',
        }}
      >
        <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>Manual / Emergency Sub</h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="emergency-sub-out"
              style={{ fontSize: '11px', color: styles.colors.muted, display: 'block', marginBottom: '4px' }}
            >
              Sub OUT
            </label>
            <select
              id="emergency-sub-out"
              value={emergencySubOut || ''}
              onChange={(e) => onSetEmergencySubOut(e.target.value || null)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: styles.colors.surface,
                border: `1px solid ${styles.colors.border}`,
                borderRadius: '4px',
                color: styles.colors.text,
                fontSize: '13px',
              }}
            >
              <option value="">Select...</option>
              {rotation.map((playerId) => {
                if (!playerId) return null
                const player = getPlayerById(playerId)
                if (!player) return null
                return (
                  <option key={playerId} value={playerId}>
                    {player.name}
                  </option>
                )
              })}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="emergency-sub-in"
              style={{ fontSize: '11px', color: styles.colors.muted, display: 'block', marginBottom: '4px' }}
            >
              Sub IN
            </label>
            <select
              id="emergency-sub-in"
              value={emergencySubIn || ''}
              onChange={(e) => onSetEmergencySubIn(e.target.value || null)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: styles.colors.surface,
                border: `1px solid ${styles.colors.border}`,
                borderRadius: '4px',
                color: styles.colors.text,
                fontSize: '13px',
              }}
            >
              <option value="">Select...</option>
              {benchPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={onMakeEmergencySub}
          disabled={!emergencySubOut || !emergencySubIn}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: emergencySubOut && emergencySubIn ? styles.colors.blue : styles.colors.surface,
            border: 'none',
            borderRadius: '6px',
            color: emergencySubOut && emergencySubIn ? '#fff' : styles.colors.muted,
            fontSize: '13px',
            fontWeight: '600',
            cursor: emergencySubOut && emergencySubIn ? 'pointer' : 'not-allowed',
          }}
        >
          Make Sub
        </button>
      </div>

      {currentGame < 3 && (
        <button
          onClick={onStartNextGame}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            border: `2px solid ${styles.colors.blue}`,
            borderRadius: '8px',
            color: styles.colors.blue,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Start Game {currentGame + 1} →
        </button>
      )}

      <button
        onClick={onResetGame}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: 'transparent',
          border: `1px solid rgba(239, 68, 68, 0.5)`,
          borderRadius: '8px',
          color: styles.colors.red,
          fontSize: '13px',
          cursor: 'pointer',
          marginTop: '16px',
        }}
      >
        ✕ Cancel & Reset Game
      </button>
    </div>
  )
}
