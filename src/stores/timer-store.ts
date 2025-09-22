import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  timeLeft: number
  totalTime: number
  exerciseName: string | null
  startTimer: (seconds: number, exerciseName?: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  tick: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  timeLeft: 0,
  totalTime: 0,
  exerciseName: null,

  startTimer: (seconds: number, exerciseName?: string) => {
    set({
      isRunning: true,
      timeLeft: seconds,
      totalTime: seconds,
      exerciseName: exerciseName || null,
    })
  },

  pauseTimer: () => {
    set({ isRunning: false })
  },

  resumeTimer: () => {
    set({ isRunning: true })
  },

  stopTimer: () => {
    set({
      isRunning: false,
      timeLeft: 0,
      totalTime: 0,
      exerciseName: null,
    })
  },

  tick: () => {
    const { timeLeft, isRunning } = get()
    if (isRunning && timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 })
    } else if (timeLeft === 0) {
      set({ isRunning: false })
    }
  },
}))
