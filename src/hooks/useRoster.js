import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { generateId } from '../utils'

export function useRoster() {
  const [players, setPlayers] = useLocalStorage('vb_roster', [])
  const [record, setRecord] = useLocalStorage('vb_record', { wins: 0, losses: 0 })
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const openAddPlayer = () => {
    setEditingPlayer(null)
    setShowPlayerModal(true)
  }

  const openEditPlayer = (player) => {
    setEditingPlayer(player)
    setShowPlayerModal(true)
  }

  const closePlayerModal = () => {
    setShowPlayerModal(false)
    setEditingPlayer(null)
    setDeleteConfirmId(null)
  }

  const savePlayer = (playerData) => {
    if (editingPlayer) {
      setPlayers((prev) => prev.map((p) => (p.id === editingPlayer.id ? { ...playerData, id: editingPlayer.id } : p)))
    } else {
      setPlayers((prev) => [...prev, { ...playerData, id: generateId() }])
    }
    closePlayerModal()
  }

  const deletePlayer = (id) => {
    if (deleteConfirmId === id) {
      setPlayers((prev) => prev.filter((p) => p.id !== id))
      closePlayerModal()
    } else {
      setDeleteConfirmId(id)
    }
  }

  const getPlayerById = (id) => players.find((p) => p.id === id)

  const logWin = () => setRecord((prev) => ({ wins: prev.wins + 1, losses: prev.losses }))
  const logLoss = () => setRecord((prev) => ({ wins: prev.wins, losses: prev.losses + 1 }))
  const resetRecord = () => setRecord({ wins: 0, losses: 0 })

  return {
    players,
    record,
    showPlayerModal,
    editingPlayer,
    deleteConfirmId,
    openAddPlayer,
    openEditPlayer,
    closePlayerModal,
    savePlayer,
    deletePlayer,
    getPlayerById,
    logWin,
    logLoss,
    resetRecord,
  }
}
