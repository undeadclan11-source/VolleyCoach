import { styles, getRatingColor } from '../utils'

export function AttendanceView({ players, attendance, presentPlayers, onToggleAttendance, onMarkAllPresent, onResetAttendance, onLateArrival }) {
  const sortedPlayers = [...players].sort((a, b) => b.overall - a.overall)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
            border: `1px solid ${styles.colors.orange}`,
            borderRadius: '6px',
            color: styles.colors.orange,
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
              <span style={{ fontSize: '12px', fontWeight: '600', color: isPresent ? styles.colors.green : styles.colors.muted }}>
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
