export const getSetTargetScore = (gameNumber) => (gameNumber === 3 ? 15 : 25)

export const getSetWinner = (score, gameNumber) => {
  const targetScore = getSetTargetScore(gameNumber)

  if (score.us >= targetScore && score.us - score.them >= 2) return 'us'
  if (score.them >= targetScore && score.them - score.us >= 2) return 'them'
  return null
}
