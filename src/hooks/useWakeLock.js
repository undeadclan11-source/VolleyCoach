import { useRef, useEffect } from 'react'

export function useWakeLock(activeTab) {
  const lockRef = useRef(null)

  useEffect(() => {
    const acquire = async () => {
      if ('wakeLock' in navigator) {
        try {
          lockRef.current = await navigator.wakeLock.request('screen')
        } catch {
          // Silent fail — device may not support it or page is backgrounded
        }
      }
    }

    const release = async () => {
      if (lockRef.current) {
        try {
          await lockRef.current.release()
          lockRef.current = null
        } catch {
          // Silent fail
        }
      }
    }

    if (activeTab === 'ingame') {
      acquire()
    } else {
      release()
    }

    return () => {
      release()
    }
  }, [activeTab])
}
