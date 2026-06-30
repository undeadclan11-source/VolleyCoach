import { useState } from 'react'
import { styles } from './utils'
import { useRoster } from './hooks/useRoster'
import { useGameState } from './hooks/useGameState'
import { useWakeLock } from './hooks/useWakeLock'
import { RosterTab } from './components/RosterTab'
import { GameDayTab } from './components/GameDayTab'
import { InGameTab } from './components/InGameTab'
import { PlayerModal } from './components/PlayerModal'
import { SettingsModal } from './components/SettingsModal'
import { LateArrivalModal } from './components/LateArrivalModal'

export default function App() {
  const [activeTab, setActiveTab] = useState('roster')
  const [gameSubTab, setGameSubTab] = useState('attendance')
  const [showSettings, setShowSettings] = useState(false)
  const [showLateArrivalModal, setShowLateArrivalModal] = useState(false)

  const roster = useRoster()
  const game = useGameState(roster.players)

  useWakeLock(activeTab)

  const handleLogResult = (result) => {
    if (result === 'win') roster.logWin()
    else roster.logLoss()

    game.endLoggedGame()
    setActiveTab('roster')
  }

  const navTabs = [
    {
      id: 'roster',
      label: 'Roster',
      ariaLabel: 'Roster tab',
      icon: (active) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="7" r="4" />
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" opacity={active ? 1 : 0.5} />
          <path d="M21 21v-2a4 4 0 0 0-3-3.87" opacity={active ? 1 : 0.5} />
        </svg>
      ),
    },
    {
      id: 'gameday',
      label: 'Game Day',
      ariaLabel: 'Game Day tab',
      icon: () => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
        </svg>
      ),
    },
    {
      id: 'ingame',
      label: 'In-Game',
      ariaLabel: 'In-Game tab',
      icon: () => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a12.3 12.3 0 0 0 4 10 12.3 12.3 0 0 0-4 10" />
          <path d="M3 9h18M3 15h18" />
        </svg>
      ),
    },
  ]

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
        <div
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: styles.colors.orange,
            fontFamily: styles.fontFamilyDisplay,
            letterSpacing: '-0.02em',
          }}
        >
          🏐 VolleyCoach
        </div>
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
              GAME {game.currentGame}
            </div>
          ) : roster.record.wins > 0 || roster.record.losses > 0 ? (
            <span style={{ fontSize: '13px', fontWeight: 800, color: styles.colors.muted }}>
              {roster.record.wins}W – {roster.record.losses}L
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
            players={roster.players}
            record={roster.record}
            onAddPlayer={roster.openAddPlayer}
            onEditPlayer={roster.openEditPlayer}
            onResetRecord={roster.resetRecord}
          />
        )}

        {activeTab === 'gameday' && (
          <GameDayTab
            subTab={gameSubTab}
            setSubTab={setGameSubTab}
            players={roster.players}
            attendance={game.attendance}
            presentPlayers={game.presentPlayers}
            benchPlayers={game.benchPlayers}
            rotation={game.rotation}
            subPlan={game.subPlan}
            selectedBenchPlayer={game.selectedBenchPlayer}
            game2StartPlan={game.game2StartPlan}
            setGame2StartPlan={game.setGame2StartPlan}
            onToggleAttendance={game.toggleAttendance}
            onMarkAllPresent={game.markAllPresent}
            onResetAttendance={game.resetAttendance}
            onAutoSuggest={game.autoSuggestLineup}
            onCourtSlotClick={game.handleCourtSlotClick}
            onBenchPlayerClick={game.handleBenchPlayerClick}
            onAssignSubPlan={game.assignSubPlan}
            getPlayerById={roster.getPlayerById}
            onLateArrival={() => setShowLateArrivalModal(true)}
          />
        )}

        {activeTab === 'ingame' && (
          <InGameTab
            key={game.currentGame}
            score={game.score}
            currentGame={game.currentGame}
            rotation={game.rotation}
            setRotation={game.setRotation}
            benchPlayers={game.benchPlayers}
            subPlan={game.subPlan}
            setSubPlan={game.setSubPlan}
            plannedSubPlan={game.plannedSubPlan}
            subsExecuted={game.subsExecuted}
            alertDismissed={game.alertDismissed}
            shouldShowSubAlert={game.shouldShowSubAlert}
            subAlertThreshold={game.subAlertThreshold}
            gameWonBy={game.gameWonBy}
            emergencySubOut={game.emergencySubOut}
            emergencySubIn={game.emergencySubIn}
            onUpdateScore={game.updateScore}
            onRotate={game.rotateTeam}
            onExecuteSub={game.executeSub}
            onDismissAlert={() => game.setAlertDismissed(true)}
            onReshowAlert={() => game.setAlertDismissed(false)}
            onSetEmergencySubOut={game.setEmergencySubOut}
            onSetEmergencySubIn={game.setEmergencySubIn}
            onMakeEmergencySub={game.makeEmergencySub}
            onStartNextGame={game.startNextGame}
            onResetGame={game.resetGame}
            onLogWin={() => handleLogResult('win')}
            onLogLoss={() => handleLogResult('loss')}
            record={roster.record}
            getPlayerById={roster.getPlayerById}
            isLineupComplete={game.isLineupComplete}
          />
        )}
      </main>

      {/* Bottom Nav */}
      <nav
        aria-label="App navigation"
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
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.ariaLabel}
            aria-current={activeTab === tab.id ? 'page' : undefined}
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
            {tab.icon(activeTab === tab.id)}
            <span style={{ fontSize: '11px', fontWeight: '500' }}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Modals */}
      {roster.showPlayerModal && (
        <PlayerModal
          player={roster.editingPlayer}
          onSave={roster.savePlayer}
          onDelete={roster.deletePlayer}
          onClose={roster.closePlayerModal}
          deleteConfirmId={roster.deleteConfirmId}
        />
      )}

      {showLateArrivalModal && (
        <LateArrivalModal
          players={roster.players.filter((p) => !game.attendance[p.id])}
          onMarkPresent={(id) => {
            game.toggleAttendance(id)
            setShowLateArrivalModal(false)
          }}
          onClose={() => setShowLateArrivalModal(false)}
        />
      )}

      {showSettings && (
        <SettingsModal settings={game.settings} onChange={game.setSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
