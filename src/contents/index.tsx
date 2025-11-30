import type { PlasmoCSConfig } from "plasmo"
import cssText from "data-text:../ui/style.css" 
import { AgentDashboard } from "../ui/dashboard"
import { Visualizer } from "../ui/visualizer"
import { AgentLoop } from "../core/loop" 
import { useAgentStore } from "../core/machine"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_idle"
}

// Inject Tailwind styles into the Shadow DOM
export const getStyle = () => {
  return cssText
}

/**
 * Main Application Root
 * Assembles the Logic (Loop), Debugging UI (Visualizer), and Control UI (Dashboard).
 */
const ContentApp = () => {
  const status = useAgentStore(s => s.status)
  
  // Only show visualizer when active
  const showVisualizer = status !== "IDLE" && status !== "STOPPED"

  return (
    <div className="plasmo-root">
      {/* 1. The Brain Loop (Invisible Logic) */}
      <AgentLoop /> 
      
      {/* 2. The Visual Debugger */}
      {showVisualizer && <Visualizer />}
      
      {/* 3. The Control Panel */}
      <AgentDashboard />
    </div>
  )
}

export default ContentApp