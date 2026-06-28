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

  const navTabs = [
    { id: 'roster', icon: '👥', label: 'Roster', ariaLabel: 'Roster tab' },
    { id: 'gameday', icon: '📋', label: 'Game Day', ariaLabel: 'Game Day tab' },
    { id: 'ingame', icon: '🏐', label: 'In-Game', ariaLabel: 'In-Game tab' },
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
        <div style={{ fontSize: '20px', fontWeight: '700', color: styles.colors.orange, fontFamily: styles.fontFamilyDisplay, letterSpacing: '-0.02em' }}>
          🏐 VolleyCoach
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeTab === 'ingame' ? (
            <div style={{ backgroundColor: styles.colors.card, padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: styles.colors.orange }}>
              GAME {game.currentGame}
            </div>
          ) : (roster.record.wins > 0 || roster.record.losses > 0) ? (
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
            score={game.score}
            currentGame={game.currentGame}
            rotation={game.rotation}
            setRotation={game.setRotation}
            benchPlayers={game.benchPlayers}
            subPlan={game.subPlan}
            setSubPlan={game.setSubPlan}
            subsExecuted={game.subsExecuted}
            alertDismissed={game.alertDismissed}
            shouldShowSubAlert={game.shouldShowSubAlert}
            subAlertThreshold={game.subAlertThreshold}
            gameWonBy={game.gameWonBy}
            emergencySubOut={game.emergencySubOut}
            emergencySubIn={game.emergencySubIn}
            record={roster.record}
            game2StartPlan={game.game2StartPlan}
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
            onLogWin={roster.logWin}
            onLogLoss={roster.logLoss}
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
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
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
        <SettingsModal
          settings={game.settings}
          onChange={game.setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
