import { styles } from '../utils'
import { AttendanceView } from './AttendanceView'
import { LineupView } from './LineupView'
import { SubPlanView } from './SubPlanView'

const tabs = [
  { id: 'attendance', label: 'Attendance' },
  { id: 'lineup', label: 'Lineup' },
  { id: 'subplan', label: 'Sub Plan' },
]

export function GameDayTab({
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
  return (
    <div>
      <div style={{ display: 'flex', borderBottom: `1px solid ${styles.colors.border}` }}>
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
