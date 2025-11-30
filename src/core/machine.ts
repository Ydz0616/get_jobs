import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

/**
 * 1. Define the possible states of OODA Loop
 */
export type AgentStatus = 
  | "IDLE"        // Waiting for user to click Start
  | "SCANNING"    // Looking at the page (running scanner)
  | "PLANNING"    // Deciding what to do (LLM or Rule check)
  | "EXECUTING"   // Filling forms or Clicking buttons
  | "NAVIGATING"  // Clicked 'Next', waiting for page reload
  | "FIXING"      // Error detected, trying to fix
  | "SUCCESS"     // Reached 'Submit' page
  | "STOPPED"     // User paused manually

/**
 * 2. Define the Store Schema
 */
interface AgentState {
  status: AgentStatus
  logs: string[]      // The "Thought Process" history
  url: string         // Current page URL to detect navigation
  
  // Actions
  start: () => void
  stop: () => void
  setStatus: (status: AgentStatus) => void
  addLog: (message: string) => void
  reset: () => void
}

/**
 * 3. Create the Store Hook
 */
export const useAgentStore = create<AgentState>()(
  subscribeWithSelector((set, get) => ({
    status: "IDLE",
    logs: [],
    url: "",

    start: () => {
      set({ 
        status: "SCANNING", 
        logs: ["Agent active. Starting OODA Loop..."],
        url: window.location.href 
      })
    },

    stop: () => {
      set((state) => ({ 
        status: "STOPPED", 
        logs: [...state.logs, "Agent manually stopped."] 
      }))
    },

    setStatus: (status) => {
      // Auto-log status changes for debugging
      set((state) => ({ 
        status,
        logs: [...state.logs, `State changed to: [${status}]`] 
      }))
    },

    addLog: (msg) => {
      const time = new Date().toLocaleTimeString()
      set((state) => ({ 
        logs: [...state.logs, `[${time}] ${msg}`] 
      }))
    },

    reset: () => {
      set({ status: "IDLE", logs: [], url: "" })
    }
  }))
)