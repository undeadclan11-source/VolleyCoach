import { useState, useEffect, useCallback } from 'react'

// ==================== UTILITIES ====================
const generateId = () => Math.random().toString(36).substr(2, 9)

const getRatingColor = (rating) => {
  if (rating >= 4) return '#22C55E'
  if (rating >= 3) return '#F97316'
  return '#EF4444'
}

// ==================== STYLES ====================
const styles = {
  fontFamily: '-apple-system, "SF Pro Text", "Segoe UI", sans-serif',
  colors: {
    background: '#080D17',
    surface: '#111827',
    card: '#1A2235',
    border: '#243048',
    orange: '#F97316',
    green: '#22C55E',
    red: '#EF4444',
    blue: '#3B82F6',
    yellow: '#FBBF24',
    text: '#F1F5F9',
    muted: '#64748B',
    court: '#0D1A30',
  },
}

// ==================== MAIN APP ====================
export default function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState('roster')
  const [gameSubTab, setGameSubTab] = useState('attendance')

  // Roster (persisted)
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('vb_roster')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Record (persisted)
  const [record, setRecord] = useState(() => {
    try {
      const saved = localStorage.getItem('vb_record')
      return saved ? JSON.parse(saved) : { wins: 0, losses: 0 }
    } catch {
      return { wins: 0, losses: 0 }
    }
  })

  // Settings (persisted) — default matches "no required subs in a deciding 3rd set"
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('vb_settings')
      return saved ? JSON.parse(saved) : { thirdSetRequiresSubs: false }
    } catch {
      return { thirdSetRequiresSubs: false }
    }
  })
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    localStorage.setItem('vb_settings', JSON.stringify(settings))
  }, [settings])

  // Session state
  const [attendance, setAttendance] = useState({})
  const [rotation, setRotation] = useState([null, null, null, null, null, null])
  const [subPlan, setSubPlan] = useState({})
  const [score, setScore] = useState({ us: 0, them: 0 })
  const [currentGame, setCurrentGame] = useState(1)
  const [game1Bench, setGame1Bench] = useState([])
  const [game2Bench, setGame2Bench] = useState([])
  const [subsExecuted, setSubsExecuted] = useState({})
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [selectedBenchPlayer, setSelectedBenchPlayer] = useState(null)
  const [game2StartPlan, setGame2StartPlan] = useState([])

  // Modal state
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [showLateArrivalModal, setShowLateArrivalModal] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Wake Lock
  const [wakeLock, setWakeLock] = useState(null)

  // Persist roster
  useEffect(() => {
    localStorage.setItem('vb_roster', JSON.stringify(players))
  }, [players])

  // Persist record
  useEffect(() => {
    localStorage.setItem('vb_record', JSON.stringify(record))
  }, [record])

  // Wake Lock management
  useEffect(() => {
    const requestWakeLock = async () => {
      if (activeTab === 'ingame' && 'wakeLock' in navigator) {
        try {
          const lock = await navigator.wakeLock.request('screen')
          setWakeLock(lock)
        } catch (err) {
          // Silent fail
        }
      }
    }

    const releaseWakeLock = async () => {
      if (wakeLock) {
        try {
          await wakeLock.release()
          setWakeLock(null)
        } catch (err) {
          // Silent fail
        }
      }
    }

    if (activeTab === 'ingame') {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [activeTab])

  // Derived state
  const presentPlayers = players.filter((p) => attendance[p.id])
  const benchPlayers = presentPlayers.filter((p) => !rotation.includes(p.id))
  const isLineupComplete = rotation.every((id) => id !== null)

  // Player CRUD
  const savePlayer = (playerData) => {
    if (editingPlayer) {
      setPlayers((prev) => prev.map((p) => (p.id === editingPlayer.id ? { ...playerData, id: editingPlayer.id } : p)))
    } else {
      setPlayers((prev) => [...prev, { ...playerData, id: generateId() }])
    }
    setShowPlayerModal(false)
    setEditingPlayer(null)
  }

  const deletePlayer = (id) => {
    if (deleteConfirmId === id) {
      setPlayers((prev) => prev.filter((p) => p.id !== id))
      setShowPlayerModal(false)
      setEditingPlayer(null)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
    }
  }

  // Attendance
  const toggleAttendance = (id) => {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const markAllPresent = () => {
    const newAttendance = {}
    players.forEach((p) => {
      newAttendance[p.id] = true
    })
    setAttendance(newAttendance)
  }

  const resetAttendance = () => {
    if (window.confirm('Start fresh? This clears your lineup and sub plan.')) {
      setAttendance({})
      setRotation([null, null, null, null, null, null])
      setSubPlan({})
      setSelectedBenchPlayer(null)
    }
  }

  // Lineup
  const autoSuggestLineup = () => {
    const sorted = [...presentPlayers].sort((a, b) => b.overall - a.overall)
    const top6 = sorted.slice(0, 6)
    // Interleave pattern: rank 1→0, rank 2→2, rank 3→4, rank 4→1, rank 5→3, rank 6→5
    const pattern = [0, 2, 4, 1, 3, 5]
    const newRotation = [null, null, null, null, null, null]
    pattern.forEach((rotIndex, rankIndex) => {
      if (top6[rankIndex]) {
        newRotation[rotIndex] = top6[rankIndex].id
      }
    })
    setRotation(newRotation)
    setSelectedBenchPlayer(null)
  }

  const handleCourtSlotClick = (index) => {
    if (selectedBenchPlayer) {
      const currentPlayerId = rotation[index]
      if (currentPlayerId) {
        // Swap
        setRotation((prev) => {
          const newRot = [...prev]
          newRot[index] = selectedBenchPlayer
          return newRot
        })
      } else {
        // Place in empty slot
        setRotation((prev) => {
          const newRot = [...prev]
          newRot[index] = selectedBenchPlayer
          return newRot
        })
      }
      setSelectedBenchPlayer(null)
    } else if (rotation[index]) {
      // Remove to bench
      setRotation((prev) => {
        const newRot = [...prev]
        newRot[index] = null
        return newRot
      })
    }
  }

  const handleBenchPlayerClick = (playerId) => {
    if (selectedBenchPlayer === playerId) {
      setSelectedBenchPlayer(null)
    } else {
      setSelectedBenchPlayer(playerId)
    }
  }

  // Sub Plan
  const assignSubPlan = (benchPlayerId, rotationIndex) => {
    // Check if this bench player is already assigned
    const existingAssignment = Object.entries(subPlan).find(([, bpId]) => bpId === benchPlayerId)
    if (existingAssignment && parseInt(existingAssignment[0]) === rotationIndex) {
      // Unassign
      setSubPlan((prev) => {
        const newPlan = { ...prev }
        delete newPlan[rotationIndex]
        return newPlan
      })
    } else {
      // Remove any existing assignment for this bench player
      setSubPlan((prev) => {
        const newPlan = { ...prev }
        Object.keys(newPlan).forEach((key) => {
          if (newPlan[key] === benchPlayerId) {
            delete newPlan[key]
          }
        })
        newPlan[rotationIndex] = benchPlayerId
        return newPlan
      })
    }
  }

  // Scoring
  const updateScore = (team, delta) => {
    setScore((prev) => ({
      ...prev,
      [team]: Math.max(0, prev[team] + delta),
    }))
  }

  // Rotation
  const rotateTeam = () => {
    setRotation((prev) => [...prev.slice(1), prev[0]])
  }

  // Execute sub
  const executeSub = (rotationIndex, incomingPlayerId) => {
    setRotation((prev) => {
      const newRot = [...prev]
      newRot[rotationIndex] = incomingPlayerId
      return newRot
    })
    setSubsExecuted((prev) => ({ ...prev, [rotationIndex]: true }))
  }

  // Emergency sub
  const [emergencySubOut, setEmergencySubOut] = useState(null)
  const [emergencySubIn, setEmergencySubIn] = useState(null)

  const makeEmergencySub = () => {
    if (emergencySubOut !== null && emergencySubIn) {
      const outIndex = rotation.indexOf(emergencySubOut)
      if (outIndex !== -1) {
        setRotation((prev) => {
          const newRot = [...prev]
          newRot[outIndex] = emergencySubIn
          return newRot
        })
      }
      setEmergencySubOut(null)
      setEmergencySubIn(null)
    }
  }

  // Game transitions
  const startNextGame = () => {
    const nextGame = currentGame + 1
    if (nextGame > 3) return

    // Track who was on bench
    if (currentGame === 1) {
      setGame1Bench(benchPlayers.map((p) => p.id))
    } else if (currentGame === 2) {
      setGame2Bench(benchPlayers.map((p) => p.id))
    }

    const prevBench = currentGame === 1 ? benchPlayers.map((p) => p.id) : game2Bench

    // If the coach built a Game 2 starting lineup in the Sub Plan tab, use it.
    // Filter out anyone no longer present in case attendance changed since planning.
    const validPlannedStarters = game2StartPlan.filter((id) => presentPlayers.some((p) => p.id === id))

    let newRotation
    if (currentGame === 1 && validPlannedStarters.length === 6) {
      newRotation = [...validPlannedStarters]
    } else {
      // Fallback: required bench players first, fill remaining spots in roster order
      newRotation = [...prevBench.slice(0, 6)]
      const remaining = presentPlayers.filter((p) => !newRotation.includes(p.id)).map((p) => p.id)
      while (newRotation.length < 6 && remaining.length > 0) {
        newRotation.push(remaining.shift())
      }
      while (newRotation.length < 6) {
        newRotation.push(null)
      }
    }

    setRotation(newRotation)
    setCurrentGame(nextGame)
    setScore({ us: 0, them: 0 })
    setSubPlan({}) // last game's planned subs don't apply to a new rotation
    setSubsExecuted({})
    setAlertDismissed(false)
    setGame2StartPlan([]) // consumed — clear so it doesn't leak into Game 3
  }

  const resetGame = () => {
    if (window.confirm('Reset everything? This clears the score, rotation, and sub plan. Roster stays.')) {
      setScore({ us: 0, them: 0 })
      setRotation([null, null, null, null, null, null])
      setSubPlan({})
      setCurrentGame(1)
      setGame1Bench([])
      setGame2Bench([])
      setSubsExecuted({})
      setAlertDismissed(false)
    }
  }

  // Check sub alert
  const subAlertThreshold = currentGame === 3 ? 7 : 13
  const subsRequiredThisGame = currentGame !== 3 || settings.thirdSetRequiresSubs
  const shouldShowSubAlert =
    subsRequiredThisGame &&
    (score.us >= subAlertThreshold || score.them >= subAlertThreshold) &&
    Object.keys(subPlan).some((key) => !subsExecuted[key]) &&
    !alertDismissed

  // Check game won
  const winningScore = currentGame === 3 ? 15 : 25
  const gameWonBy = score.us >= winningScore ? 'us' : score.them >= winningScore ? 'them' : null

  // Record
  const logWin = () => setRecord((prev) => ({ wins: prev.wins + 1, losses: prev.losses }))
  const logLoss = () => setRecord((prev) => ({ wins: prev.wins, losses: prev.losses + 1 }))
  const resetRecord = () => {
    setRecord({ wins: 0, losses: 0 })
  }

  const getPlayerById = (id) => players.find((p) => p.id === id)

  // ==================== RENDER ====================
  return (
    <div
      style={{
        fontFamily: styles.fontFamily,
        backgroundColor: styles.colors.background,
        color: styles.colors.text,
        minHeight: '100vh',
        maxWidth: '480px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: styles.colors.surface,
          borderBottom: `1px solid ${styles.colors.border}`,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: '700', color: styles.colors.orange }}>🏐 VolleyCoach</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeTab === 'ingame' ? (
            <div
              style={{
                backgroundColor: styles.colors.card,
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: styles.colors.orange,
              }}
            >
              GAME {currentGame}
            </div>
          ) : (record.wins > 0 || record.losses > 0) ? (
            <span style={{
              fontSize: '13px',
              fontWeight: 800,
              color: styles.colors.muted,
            }}>
              {record.wins}W – {record.losses}L
            </span>
          ) : null}
          <button
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: `1px solid ${styles.colors.border}`,
              backgroundColor: styles.colors.card,
              color: styles.colors.muted,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto', paddingBottom: '80px' }}>
        {activeTab === 'roster' && (
          <RosterTab
            players={players}
            onAddPlayer={() => {
              setEditingPlayer(null)
              setShowPlayerModal(true)
            }}
            onEditPlayer={(player) => {
              setEditingPlayer(player)
              setShowPlayerModal(true)
            }}
            onResetRecord={resetRecord}
          />
        )}

        {activeTab === 'gameday' && (
          <GameDayTab
            subTab={gameSubTab}
            setSubTab={setGameSubTab}
            players={players}
            attendance={attendance}
            presentPlayers={presentPlayers}
            benchPlayers={benchPlayers}
            rotation={rotation}
            subPlan={subPlan}
            selectedBenchPlayer={selectedBenchPlayer}
            game2StartPlan={game2StartPlan}
            setGame2StartPlan={setGame2StartPlan}
            onToggleAttendance={toggleAttendance}
            onMarkAllPresent={markAllPresent}
            onResetAttendance={resetAttendance}
            onAutoSuggest={autoSuggestLineup}
            onCourtSlotClick={handleCourtSlotClick}
            onBenchPlayerClick={handleBenchPlayerClick}
            onAssignSubPlan={assignSubPlan}
            getPlayerById={getPlayerById}
            onLateArrival={() => setShowLateArrivalModal(true)}
          />
        )}

        {activeTab === 'ingame' && (
          <InGameTab
            score={score}
            currentGame={currentGame}
            rotation={rotation}
            setRotation={setRotation}
            benchPlayers={benchPlayers}
            subPlan={subPlan}
            setSubPlan={setSubPlan}
            subsExecuted={subsExecuted}
            alertDismissed={alertDismissed}
            shouldShowSubAlert={shouldShowSubAlert}
            subAlertThreshold={subAlertThreshold}
            gameWonBy={gameWonBy}
            emergencySubOut={emergencySubOut}
            emergencySubIn={emergencySubIn}
            record={record}
            game2StartPlan={game2StartPlan}
            onUpdateScore={updateScore}
            onRotate={rotateTeam}
            onExecuteSub={executeSub}
            onDismissAlert={() => setAlertDismissed(true)}
            onReshowAlert={() => setAlertDismissed(false)}
            onSetEmergencySubOut={setEmergencySubOut}
            onSetEmergencySubIn={setEmergencySubIn}
            onMakeEmergencySub={makeEmergencySub}
            onStartNextGame={startNextGame}
            onResetGame={resetGame}
            onLogWin={logWin}
            onLogLoss={logLoss}
            getPlayerById={getPlayerById}
            isLineupComplete={isLineupComplete}
          />
        )}
      </main>

      {/* Bottom Nav */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          backgroundColor: styles.colors.surface,
          borderTop: `1px solid ${styles.colors.border}`,
          display: 'flex',
          zIndex: 100,
        }}
      >
        {[
          { id: 'roster', icon: '👥', label: 'Roster' },
          { id: 'gameday', icon: '📋', label: 'Game Day' },
          { id: 'ingame', icon: '🏐', label: 'In-Game' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: activeTab === tab.id ? styles.colors.orange : styles.colors.muted,
            }}
          >
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span style={{ fontSize: '11px', fontWeight: '500' }}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Player Modal */}
      {showPlayerModal && (
        <PlayerModal
          player={editingPlayer}
          onSave={savePlayer}
          onDelete={deletePlayer}
          onClose={() => {
            setShowPlayerModal(false)
            setEditingPlayer(null)
            setDeleteConfirmId(null)
          }}
          deleteConfirmId={deleteConfirmId}
        />
      )}

      {/* Late Arrival Modal */}
      {showLateArrivalModal && (
        <LateArrivalModal
          players={players.filter((p) => !attendance[p.id])}
          onMarkPresent={(id) => {
            setAttendance((prev) => ({ ...prev, [id]: true }))
            setShowLateArrivalModal(false)
          }}
          onClose={() => setShowLateArrivalModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={(next) => setSettings(next)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

// ==================== ROSTER TAB ====================
function RosterTab({ players, onAddPlayer, onEditPlayer, onResetRecord }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const sortedPlayers = [...players].sort((a, b) => b.overall - a.overall)

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Season Roster ({players.length})
      </h2>

      {sortedPlayers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            color: styles.colors.muted,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <p>No players yet</p>
          <p style={{ fontSize: '14px' }}>Tap + to add your first player</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                  <div
                    style={{
                      fontSize: '11px',
                      color: styles.colors.muted,
                      fontStyle: 'italic',
                      marginTop: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {player.notes}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Reset record link */}
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

      {/* FAB */}
      <button
        onClick={onAddPlayer}
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '16px',
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

// ==================== GAME DAY TAB ====================
function GameDayTab({
  subTab,
  setSubTab,
  players,
  attendance,
  presentPlayers,
  benchPlayers,
  rotation,
  subPlan,
  selectedBenchPlayer,
  game2StartPlan,
  setGame2StartPlan,
  onToggleAttendance,
  onMarkAllPresent,
  onResetAttendance,
  onAutoSuggest,
  onCourtSlotClick,
  onBenchPlayerClick,
  onAssignSubPlan,
  getPlayerById,
  onLateArrival,
}) {
  const tabs = [
    { id: 'attendance', label: 'Attendance' },
    { id: 'lineup', label: 'Lineup' },
    { id: 'subplan', label: 'Sub Plan' },
  ]

  return (
    <div>
      {/* Sub-tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${styles.colors.border}`,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              color: subTab === tab.id ? styles.colors.orange : styles.colors.muted,
              borderBottom: subTab === tab.id ? `2px solid ${styles.colors.orange}` : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        {subTab === 'attendance' && (
          <AttendanceView
            players={players}
            attendance={attendance}
            presentPlayers={presentPlayers}
            onToggleAttendance={onToggleAttendance}
            onMarkAllPresent={onMarkAllPresent}
            onResetAttendance={onResetAttendance}
            onLateArrival={onLateArrival}
          />
        )}

        {subTab === 'lineup' && (
          <LineupView
            presentPlayers={presentPlayers}
            benchPlayers={benchPlayers}
            rotation={rotation}
            selectedBenchPlayer={selectedBenchPlayer}
            onAutoSuggest={onAutoSuggest}
            onCourtSlotClick={onCourtSlotClick}
            onBenchPlayerClick={onBenchPlayerClick}
            getPlayerById={getPlayerById}
          />
        )}

        {subTab === 'subplan' && (
          <SubPlanView
            benchPlayers={benchPlayers}
            presentPlayers={presentPlayers}
            rotation={rotation}
            subPlan={subPlan}
            game2StartPlan={game2StartPlan}
            setGame2StartPlan={setGame2StartPlan}
            onAssignSubPlan={onAssignSubPlan}
            getPlayerById={getPlayerById}
          />
        )}
      </div>
    </div>
  )
}

// ==================== ATTENDANCE VIEW ====================
function AttendanceView({
  players,
  attendance,
  presentPlayers,
  onToggleAttendance,
  onMarkAllPresent,
  onResetAttendance,
  onLateArrival,
}) {
  const sortedPlayers = [...players].sort((a, b) => b.overall - a.overall)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontWeight: '600' }}>
          {presentPlayers.length} of {players.length} here
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={onMarkAllPresent}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: styles.colors.card,
            border: `1px solid ${styles.colors.green}`,
            borderRadius: '6px',
            color: styles.colors.green,
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Mark All Present
        </button>
        <button
          onClick={onResetAttendance}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: styles.colors.card,
            border: `1px solid ${styles.colors.border}`,
            borderRadius: '6px',
            color: styles.colors.muted,
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Reset Attendance
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sortedPlayers.map((player) => {
          const isPresent = attendance[player.id]
          return (
            <button
              key={player.id}
              onClick={() => onToggleAttendance(player.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: styles.colors.card,
                border: `1px solid ${isPresent ? styles.colors.green : styles.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isPresent ? styles.colors.green : styles.colors.card,
                  border: `2px solid ${isPresent ? styles.colors.green : styles.colors.muted}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: isPresent ? '#fff' : styles.colors.muted,
                }}
              >
                {isPresent ? '✓' : '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', color: styles.colors.text }}>{player.name}</span>
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
                    }}
                  >
                    {player.overall}
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isPresent ? styles.colors.green : styles.colors.muted,
                }}
              >
                {isPresent ? 'HERE' : 'OUT'}
              </span>
            </button>
          )
        })}
      </div>

      <button
        onClick={onLateArrival}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '12px',
          backgroundColor: styles.colors.card,
          border: `1px dashed ${styles.colors.border}`,
          borderRadius: '8px',
          color: styles.colors.muted,
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        ➕ Late Arrival
      </button>
    </div>
  )
}

// ==================== LINEUP VIEW ====================
function LineupView({
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
        <span style={{ color: styles.colors.red, fontWeight: '600' }}>
          ⚠️ Mark at least 6 players present first.
        </span>
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

      {/* Bench */}
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

// ==================== SUB PLAN VIEW ====================
function SubPlanView({ benchPlayers, presentPlayers, rotation, subPlan, game2StartPlan, setGame2StartPlan, onAssignSubPlan, getPlayerById }) {
  // Required starters for Game 2 are the incoming subs from Section 1
  const requiredGame2Starters = Object.values(subPlan)
  
  // Optional fillers are present players NOT in required starters
  const optionalFillers = presentPlayers.filter(p => !requiredGame2Starters.includes(p.id))
  
  // Currently selected optional players
  const selectedOptional = game2StartPlan.filter(id => !requiredGame2Starters.includes(id))
  
  // Total filled spots
  const totalFilled = requiredGame2Starters.length + selectedOptional.length
  
  const toggleOptionalPlayer = (playerId) => {
    if (selectedOptional.includes(playerId)) {
      setGame2StartPlan(prev => prev.filter(id => id !== playerId))
    } else if (totalFilled < 6) {
      setGame2StartPlan(prev => [...prev, playerId])
    }
  }

  if (benchPlayers.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '32px 16px',
          color: styles.colors.muted,
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🪑</div>
        <p>No bench players — everyone&apos;s starting.</p>
      </div>
    )
  }

  const positionLabels = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

  return (
    <div>
      {/* Section 1: Game 1 Sub Plan */}
      <div style={{
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '1px',
        color: styles.colors.muted,
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
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

      {/* Divider */}
      <div style={{ height: '1px', background: styles.colors.border, margin: '20px 0' }} />

      {/* Section 2: Game 2 Starting Lineup */}
      <div style={{
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '1px',
        color: styles.colors.muted,
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        GAME 2 · STARTING LINEUP
      </div>

      {/* Required Starters (Group A) */}
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

      {/* Optional Fillers (Group B) */}
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

      {/* Spots filled count */}
      <div style={{
        fontSize: '13px',
        color: totalFilled === 6 ? styles.colors.green : styles.colors.muted,
        marginBottom: '12px',
      }}>
        {totalFilled === 6 ? '✓ Game 2 lineup is set' : `${totalFilled} of 6 spots filled`}
      </div>

      {/* Note */}
      <p style={{
        fontSize: '12px',
        color: styles.colors.muted,
        fontStyle: 'italic',
      }}>
        Players subbed in during Game 1 are required to start Game 2 per league rules.
      </p>
    </div>
  )
}

// ==================== IN-GAME TAB ====================
function InGameTab({
  score,
  currentGame,
  rotation,
  setRotation,
  benchPlayers,
  subPlan,
  setSubPlan,
  subsExecuted,
  alertDismissed,
  shouldShowSubAlert,
  subAlertThreshold,
  gameWonBy,
  emergencySubOut,
  emergencySubIn,
  record,
  game2StartPlan,
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
  getPlayerById,
  isLineupComplete,
}) {
  const winningScore = currentGame === 3 ? 15 : 25
  
  // Interactive court state
  const [selectedCourtIdx, setSelectedCourtIdx] = useState(null)
  const [selectedBenchId, setSelectedBenchId] = useState(null)
  const [subPlanNote, setSubPlanNote] = useState(null)
  
  // Handle court slot tap in In-Game mode
  const handleCourtSlotTap = (index) => {
    const playerId = rotation[index]
    
    // If a bench player is selected, swap them into this court slot
    if (selectedBenchId) {
      setRotation(prev => {
        const newRot = [...prev]
        newRot[index] = selectedBenchId
        return newRot
      })
      // Clear the destination slot's planned sub, and any other planned sub
      // that pointed at this same bench player (they can only sub in once)
      const staleKeys = Object.keys(subPlan).filter(
        (key) => Number(key) === index || subPlan[key] === selectedBenchId
      )
      if (staleKeys.length > 0) {
        setSubPlan(prev => {
          const newPlan = { ...prev }
          staleKeys.forEach((key) => delete newPlan[key])
          return newPlan
        })
        setSubPlanNote('Sub plan updated to match where you placed them.')
        setTimeout(() => setSubPlanNote(null), 3000)
      }
      setSelectedBenchId(null)
      setSelectedCourtIdx(null)
      return
    }
    
    // If a court slot is already selected
    if (selectedCourtIdx !== null) {
      if (selectedCourtIdx === index) {
        // Same slot - deselect
        setSelectedCourtIdx(null)
      } else {
        // Different slot - swap the two players
        setRotation(prev => {
          const newRot = [...prev]
          const temp = newRot[index]
          newRot[index] = newRot[selectedCourtIdx]
          newRot[selectedCourtIdx] = temp
          return newRot
        })
        // Check if either slot had a sub plan
        if (subPlan[index] || subPlan[selectedCourtIdx]) {
          setSubPlan(prev => {
            const newPlan = { ...prev }
            if (newPlan[index]) delete newPlan[index]
            if (newPlan[selectedCourtIdx]) delete newPlan[selectedCourtIdx]
            return newPlan
          })
          setSubPlanNote('Sub plan updated — planned sub removed for swapped positions.')
          setTimeout(() => setSubPlanNote(null), 3000)
        }
        setSelectedCourtIdx(null)
      }
      return
    }
    
    // Nothing selected yet
    if (playerId) {
      // Select this filled slot
      setSelectedCourtIdx(index)
    }
  }
  
  // Handle bench player tap
  const handleBenchTap = (playerId) => {
    // If same player is selected, deselect
    if (selectedBenchId === playerId) {
      setSelectedBenchId(null)
      return
    }
    
    // If a court slot is selected, swap
    if (selectedCourtIdx !== null) {
      setRotation(prev => {
        const newRot = [...prev]
        newRot[selectedCourtIdx] = playerId
        return newRot
      })
      // Clear the destination slot's planned sub, and any other planned sub
      // that pointed at this same bench player (they can only sub in once)
      const staleKeys = Object.keys(subPlan).filter(
        (key) => Number(key) === selectedCourtIdx || subPlan[key] === playerId
      )
      if (staleKeys.length > 0) {
        setSubPlan(prev => {
          const newPlan = { ...prev }
          staleKeys.forEach((key) => delete newPlan[key])
          return newPlan
        })
        setSubPlanNote('Sub plan updated to match where you placed them.')
        setTimeout(() => setSubPlanNote(null), 3000)
      }
      setSelectedCourtIdx(null)
      setSelectedBenchId(null)
      return
    }
    
    // Select this bench player
    setSelectedBenchId(playerId)
  }
  
  // Get instruction label
  const getInstructionLabel = () => {
    if (selectedCourtIdx !== null) return 'Tap another position to swap, or tap a bench player'
    if (selectedBenchId !== null) return 'Tap a court position to sub them in'
    return null
  }
  
  const instructionLabel = getInstructionLabel()

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

  return (
    <div style={{ padding: '16px' }}>
      {/* Scoreboard */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '8px',
        }}
      >
        <ScoreColumn team="US" score={score.us} onIncrement={() => onUpdateScore('us', 1)} onDecrement={() => onUpdateScore('us', -1)} color={styles.colors.green} />
        <ScoreColumn team="THEM" score={score.them} onIncrement={() => onUpdateScore('them', 1)} onDecrement={() => onUpdateScore('them', -1)} color={styles.colors.red} />
      </div>

      <div style={{ textAlign: 'center', fontSize: '12px', color: styles.colors.muted, marginBottom: '16px' }}>
        GAME {currentGame} OF 3 · RALLY SCORING · {winningScore} PTS
      </div>

      {/* Game Won Banner */}
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
          <span style={{ fontSize: '16px', fontWeight: '700', color: gameWonBy === 'us' ? styles.colors.green : styles.colors.red }}>
            {gameWonBy === 'us' ? '🏆 GAME WON — US!' : 'GAME LOST'}
          </span>
        </div>
      )}

      {/* Log Win/Loss */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={onLogWin}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #22C55E44',
            background: '#22C55E22',
            color: '#22C55E',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ✓ Log Win
        </button>
        <button
          onClick={onLogLoss}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #EF444444',
            background: '#EF444422',
            color: '#EF4444',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ✗ Log Loss
        </button>
      </div>

      {/* Sub Alert */}
      {shouldShowSubAlert && (
        <div
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
          {Object.entries(subPlan).map(([rotIndex, benchPlayerId]) => {
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

      {/* Re-show Alert Button */}
      {alertDismissed && Object.keys(subPlan).some((key) => !subsExecuted[key]) && (
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

      {/* Instruction Label */}
      {instructionLabel && (
        <div style={{
          fontSize: '12px',
          color: styles.colors.blue,
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          {instructionLabel}
        </div>
      )}

      {/* Court Diagram */}
      <CourtDiagram 
        rotation={rotation} 
        getPlayerById={getPlayerById} 
        onSlotClick={handleCourtSlotTap} 
        interactive={true}
        mode="ingame"
        selectedCourtIdx={selectedCourtIdx}
        selectedBenchId={selectedBenchId}
      />
      
      {/* Sub Plan Note */}
      {subPlanNote && (
        <div style={{
          fontSize: '12px',
          color: styles.colors.yellow,
          textAlign: 'center',
          marginTop: '8px',
        }}>
          {subPlanNote}
        </div>
      )}

      {/* Rotation Button */}
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

      {/* Bench Display - Interactive */}
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

      {/* Emergency Sub */}
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
            <label style={{ fontSize: '11px', color: styles.colors.muted, display: 'block', marginBottom: '4px' }}>
              Sub OUT
            </label>
            <select
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
            <label style={{ fontSize: '11px', color: styles.colors.muted, display: 'block', marginBottom: '4px' }}>
              Sub IN
            </label>
            <select
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

      {/* Game Transition */}
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

      {/* Reset Game */}
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

// ==================== SCORE COLUMN ====================
function ScoreColumn({ team, score, onIncrement, onDecrement, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: styles.colors.muted, marginBottom: '4px' }}>{team}</div>
      <div
        style={{
          fontSize: '76px',
          fontWeight: '700',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          color: styles.colors.text,
        }}
      >
        {score}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center' }}>
        <button
          onClick={onDecrement}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            border: `1px solid ${styles.colors.border}`,
            backgroundColor: styles.colors.card,
            color: styles.colors.muted,
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          −
        </button>
        <button
          onClick={onIncrement}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: color,
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}

// ==================== COURT DIAGRAM ====================
function CourtDiagram({ rotation, getPlayerById, onSlotClick, interactive, mode, selectedCourtIdx, selectedBenchId }) {
  // Front row: P4, P3, P2 (indexes 3, 2, 1)
  // Back row: P5, P6, P1 (indexes 4, 5, 0)
  const frontRow = [3, 2, 1]
  const backRow = [4, 5, 0]
  const positionLabels = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

  const renderSlot = (rotIndex) => {
    const playerId = rotation[rotIndex]
    const player = playerId ? getPlayerById(playerId) : null
    const isServer = rotIndex === 0
    const isSelected = mode === 'ingame' && selectedCourtIdx === rotIndex
    
    // Determine background and border based on selection state
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
        key={rotIndex}
        onClick={() => interactive && onSlotClick(rotIndex)}
        style={{
          flex: 1,
          aspectRatio: '1',
          maxWidth: '100px',
          backgroundColor,
          border: `${borderWidth} solid ${borderColor}`,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: interactive ? 'pointer' : 'default',
          padding: '8px',
          position: 'relative',
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
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  color: styles.colors.orange,
                  marginTop: '2px',
                }}
              >
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

  return (
    <div
      style={{
        backgroundColor: styles.colors.court,
        borderRadius: '12px',
        padding: '16px',
        border: `2px solid ${styles.colors.border}`,
      }}
    >
      {/* Net indicator */}
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

      {/* Front row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>{frontRow.map(renderSlot)}</div>

      {/* Back row */}
      <div style={{ display: 'flex', gap: '8px' }}>{backRow.map(renderSlot)}</div>
    </div>
  )
}

// ==================== PLAYER MODAL ====================
function PlayerModal({ player, onSave, onDelete, onClose, deleteConfirmId }) {
  const [name, setName] = useState(player?.name || '')
  const [number, setNumber] = useState(player?.number || '')
  const [gender, setGender] = useState(player?.gender || 'M')
  const [serve, setServe] = useState(player?.serve || 3)
  const [pass, setPass] = useState(player?.pass || 3)
  const [set, setSet] = useState(player?.set || 3)
  const [hit, setHit] = useState(player?.hit || 3)
  const [notes, setNotes] = useState(player?.notes || '')
  
  // Auto-calculate overall as rounded average of skill ratings
  const overall = Math.round((serve + pass + set + hit) / 4)

  // Handle keyboard visibility - resize modal when keyboard opens
  useEffect(() => {
    const sheet = document.getElementById("player-modal-sheet");
    if (!sheet) return;

    function onResize() {
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        sheet.style.maxHeight = `${window.visualViewport.height - 20}px`;
        sheet.style.paddingBottom = `${Math.max(keyboardHeight + 16, 48)}px`;
      }
    }

    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
    };
  }, []);

  const handleSave = () => {
    onSave({ name, number, gender, overall, serve, pass, set, hit, notes })
  }

  return (
    <div
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
        {/* Header */}
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

        {/* Form */}
        <div style={{ padding: '16px' }}>
          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 400);
              }}
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

          {/* Jersey Number */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
              Jersey #
            </label>
            <input
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

          {/* Gender */}
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

          {/* Skill Ratings */}
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

          {/* Overall Rating - Auto-calculated */}
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

          {/* Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Notes</label>
            <textarea
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

          {/* Buttons */}
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

// ==================== SETTINGS MODAL ====================
function SettingsModal({ settings, onChange, onClose }) {
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

// ==================== LATE ARRIVAL MODAL ====================
function LateArrivalModal({ players, onMarkPresent, onClose }) {
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
