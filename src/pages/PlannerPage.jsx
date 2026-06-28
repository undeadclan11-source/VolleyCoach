import { useEffect } from 'react'
import App from '../App'

export default function PlannerPage() {
  useEffect(() => {
    document.title = 'VolleyCoach — Game Day Planner'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    meta.id = 'planner-noindex'
    document.head.appendChild(meta)
    return () => {
      document.title = 'Volleyball Game Day Planner for Coaches | Lineups, Subs & Rotations'
      document.getElementById('planner-noindex')?.remove()
    }
  }, [])

  return <App />
}
