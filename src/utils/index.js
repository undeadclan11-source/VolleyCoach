export const generateId = () => Math.random().toString(36).substr(2, 9)

export const getRatingColor = (rating) => {
  if (rating >= 4) return 'var(--vc-green)'
  if (rating >= 3) return 'var(--vc-orange)'
  return 'var(--vc-red)'
}

export const styles = {
  fontFamily: 'var(--vc-font-body)',
  fontFamilyDisplay: 'var(--vc-font-display)',
  colors: {
    background: 'var(--vc-bg)',
    surface: 'var(--vc-surface)',
    card: 'var(--vc-card)',
    border: 'var(--vc-border)',
    orange: 'var(--vc-orange)',
    green: 'var(--vc-green)',
    red: 'var(--vc-red)',
    blue: 'var(--vc-blue)',
    yellow: 'var(--vc-yellow)',
    text: 'var(--vc-text)',
    muted: 'var(--vc-muted)',
    court: 'var(--vc-court)',
  },
}
