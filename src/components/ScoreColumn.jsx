import { styles } from '../utils'

export function ScoreColumn({ team, score, onIncrement, onDecrement, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: styles.colors.muted, marginBottom: '4px' }}>{team}</div>
      <div
        style={{
          fontSize: '76px',
          fontWeight: '700',
          fontFamily: styles.fontFamilyDisplay,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          color: styles.colors.text,
          letterSpacing: '-0.03em',
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
