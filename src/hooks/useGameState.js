import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { getSetTargetScore, getSetWinner } from '../utils/scoring'

export function useGameState(players) {
  const [settings, setSettings] = useLocalStorage('vb_settings', { thirdSetRequiresSubs: false })

  const [attendance, setAttendance] = useState({})
  const [rotation, setRotation] = useState([null, null, null, null, null, null])
  const [subPlan, setSubPlan] = useState({})
  const [score, setScore] = useState({ us: 0, them: 0 })
  const [currentGame, setCurrentGame] = useState(1)
  const [gameResults, setGameResults] = useState([])
  const [, setGame1Bench] = useState([])
  const [game2Bench, setGame2Bench] = useState([])
  const [subsExecuted, setSubsExecuted] = useState({})
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [selectedBenchPlayer, setSelectedBenchPlayer] = useState(null)
  const [game2StartPlan, setGame2StartPlan] = useState([])
  const [emergencySubOut, setEmergencySubOut] = useState(null)
  const [emergencySubIn, setEmergencySubIn] = useState(null)

  // Derived state
  const presentPlayers = players.filter((p) => attendance[p.id])
  const benchPlayers = presentPlayers.filter((p) => !rotation.includes(p.id))
  const isLineupComplete = rotation.every((id) => id !== null)

  const subAlertThreshold = currentGame === 3 ? 7 : 13
  const subsRequiredThisGame = currentGame !== 3 || settings.thirdSetRequiresSubs
  const fallbackSubPlan = benchPlayers.slice(0, rotation.length).reduce((plan, player, index) => {
    if (rotation[index]) plan[index] = player.id
    return plan
  }, {})
  const plannedSubPlan = Object.keys(subPlan).length > 0 ? subPlan : fallbackSubPlan
  const hasPendingSubs = Object.keys(plannedSubPlan).some((key) => !subsExecuted[key])
  const shouldShowSubAlert =
    subsRequiredThisGame &&
    (score.us >= subAlertThreshold || score.them >= subAlertThreshold) &&
    hasPendingSubs &&
    !alertDismissed

  const winningScore = getSetTargetScore(currentGame)
  const gameWonBy = getSetWinner(score, currentGame)

  // Attendance
  const toggleAttendance = (id) => setAttendance((prev) => ({ ...prev, [id]: !prev[id] }))

  const markAllPresent = () => {
    const next = {}
    players.forEach((p) => {
      next[p.id] = true
    })
    setAttendance(next)
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
    const pattern = [0, 2, 4, 1, 3, 5]
    const newRotation = [null, null, null, null, null, null]
    pattern.forEach((rotIndex, rankIndex) => {
      if (top6[rankIndex]) newRotation[rotIndex] = top6[rankIndex].id
    })
    setRotation(newRotation)
    setSelectedBenchPlayer(null)
  }

  const handleCourtSlotClick = (index) => {
    if (selectedBenchPlayer) {
      setRotation((prev) => {
        const next = [...prev]
        next[index] = selectedBenchPlayer
        return next
      })
      setSelectedBenchPlayer(null)
    } else if (rotation[index]) {
      setRotation((prev) => {
        const next = [...prev]
        next[index] = null
        return next
      })
    }
  }

  const handleBenchPlayerClick = (playerId) => {
    setSelectedBenchPlayer((prev) => (prev === playerId ? null : playerId))
  }

  // Sub plan
  const assignSubPlan = (benchPlayerId, rotationIndex) => {
    const existing = Object.entries(subPlan).find(([, bpId]) => bpId === benchPlayerId)
    if (existing && parseInt(existing[0]) === rotationIndex) {
      setSubPlan((prev) => {
        const next = { ...prev }
        delete next[rotationIndex]
        return next
      })
    } else {
      setSubPlan((prev) => {
        const next = { ...prev }
        Object.keys(next).forEach((key) => {
          if (next[key] === benchPlayerId) delete next[key]
        })
        next[rotationIndex] = benchPlayerId
        return next
      })
    }
  }

  // Scoring
  const updateScore = (team, delta) => setScore((prev) => ({ ...prev, [team]: Math.max(0, prev[team] + delta) }))

  // Rotation
  const rotateTeam = () => setRotation((prev) => [...prev.slice(1), prev[0]])

  // Subs
  const executeSub = (rotationIndex, incomingPlayerId) => {
    setRotation((prev) => {
      const next = [...prev]
      next[rotationIndex] = incomingPlayerId
      return next
    })
    setSubsExecuted((prev) => ({ ...prev, [rotationIndex]: true }))
  }

  const makeEmergencySub = () => {
    if (emergencySubOut !== null && emergencySubIn) {
      const outIndex = rotation.indexOf(emergencySubOut)
      if (outIndex !== -1) {
        setRotation((prev) => {
          const next = [...prev]
          next[outIndex] = emergencySubIn
          return next
        })
      }
      setEmergencySubOut(null)
      setEmergencySubIn(null)
    }
  }

  // Game transitions
  const prepareNextGame = (nextGame) => {
    if (currentGame === 1) setGame1Bench(benchPlayers.map((p) => p.id))
    else if (currentGame === 2) setGame2Bench(benchPlayers.map((p) => p.id))

    const prevBench = currentGame === 1 ? benchPlayers.map((p) => p.id) : game2Bench
    const validPlannedStarters = game2StartPlan.filter((id) => presentPlayers.some((p) => p.id === id))

    let newRotation
    if (currentGame === 1 && validPlannedStarters.length === 6) {
      newRotation = [...validPlannedStarters]
    } else {
      newRotation = [...prevBench.slice(0, 6)]
      const remaining = presentPlayers.filter((p) => !newRotation.includes(p.id)).map((p) => p.id)
      while (newRotation.length < 6 && remaining.length > 0) newRotation.push(remaining.shift())
      while (newRotation.length < 6) newRotation.push(null)
    }

    setRotation(newRotation)
    setCurrentGame(nextGame)
    setScore({ us: 0, them: 0 })
    setSubPlan({})
    setSubsExecuted({})
    setAlertDismissed(false)
    setGame2StartPlan([])
  }

  const startNextGame = () => {
    const nextGame = currentGame + 1
    if (nextGame > 3) return

    prepareNextGame(nextGame)
  }

  const logCurrentGameResult = (result) => {
    setGameResults((prev) => [
      ...prev.filter((entry) => entry.game !== currentGame),
      { game: currentGame, result, score: { ...score } },
    ])

    if (currentGame < 3) {
      prepareNextGame(currentGame + 1)
      return
    }

    setScore({ us: 0, them: 0 })
    setSubPlan({})
    setSubsExecuted({})
    setAlertDismissed(false)
    setGame2StartPlan([])
    setEmergencySubOut(null)
    setEmergencySubIn(null)
  }

  const resetGame = () => {
    if (window.confirm('Reset everything? This clears the score, rotation, and sub plan. Roster stays.')) {
      setScore({ us: 0, them: 0 })
      setRotation([null, null, null, null, null, null])
      setSubPlan({})
      setCurrentGame(1)
      setGameResults([])
      setGame1Bench([])
      setGame2Bench([])
      setSubsExecuted({})
      setAlertDismissed(false)
    }
  }

  return {
    // Settings
    settings,
    setSettings,
    // Derived
    presentPlayers,
    benchPlayers,
    isLineupComplete,
    subAlertThreshold,
    shouldShowSubAlert,
    winningScore,
    gameWonBy,
    // Raw state (needed by components)
    attendance,
    rotation,
    setRotation,
    subPlan,
    setSubPlan,
    plannedSubPlan,
    score,
    currentGame,
    gameResults,
    subsExecuted,
    alertDismissed,
    setAlertDismissed,
    selectedBenchPlayer,
    game2StartPlan,
    setGame2StartPlan,
    emergencySubOut,
    setEmergencySubOut,
    emergencySubIn,
    setEmergencySubIn,
    // Actions
    toggleAttendance,
    markAllPresent,
    resetAttendance,
    autoSuggestLineup,
    handleCourtSlotClick,
    handleBenchPlayerClick,
    assignSubPlan,
    updateScore,
    rotateTeam,
    executeSub,
    makeEmergencySub,
    startNextGame,
    logCurrentGameResult,
    resetGame,
  }
}
