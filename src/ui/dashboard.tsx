import React, { useEffect, useRef } from "react"
import { Play, Square, Loader2 } from "lucide-react" 
import { useAgentStore } from "../core/machine"

/**
 * The Control Panel (Dashboard)
 * Allows user to Start/Stop the Agent and view real-time logs.
 */
export const AgentDashboard = () => {
  const { status, logs, start, stop } = useAgentStore()
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs to bottom whenever new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // Mini Floating Button when IDLE
  if (status === "IDLE" && logs.length === 0) {
    return (
      <button 
        onClick={start}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-xl z-[2147483647] transition-all hover:scale-105"
        title="Start UCSD Job Copilot"
      >
        <Play size={24} fill="currentColor" />
      </button>
    )
  }

  // Expanded Dashboard when Active
  return (
    <div className="fixed bottom-4 right-4 bg-white w-80 rounded-xl shadow-2xl border border-slate-200 z-[2147483647] overflow-hidden flex flex-col font-sans text-slate-900">
      {/* Header */}
      <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
        <h3 className="font-bold text-sm text-slate-700">UCSD Copilot</h3>
        <StatusBadge status={status} />
      </div>

      {/* Log Window */}
      <div className="h-48 overflow-y-auto p-3 bg-slate-900 text-slate-300 text-xs font-mono space-y-1">
        {logs.length === 0 && <div className="text-slate-500 italic">Ready to initialize...</div>}
        {logs.map((log, i) => (
          <div key={i} className="break-words border-l-2 border-slate-700 pl-2">
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* Footer Controls */}
      <div className="p-3 bg-white border-t flex gap-2">
        {status === "STOPPED" ? (
           <button 
             onClick={start} 
             className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs font-medium"
           >
             <Play size={14} /> Resume
           </button>
        ) : (
           <button 
             onClick={stop} 
             className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 py-1.5 rounded text-xs font-medium"
           >
             <Square size={14} fill="currentColor" /> Stop Agent
           </button>
        )}
      </div>
    </div>
  )
}

/**
 * Helper component to render status badges with semantic colors
 */
const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = "bg-gray-100 text-gray-600"
  
  if (status === 'SCANNING') colorClass = "bg-yellow-100 text-yellow-700"
  else if (status === 'EXECUTING') colorClass = "bg-blue-100 text-blue-700"
  else if (status === 'SUCCESS') colorClass = "bg-green-100 text-green-700"
  else if (status === 'PLANNING') colorClass = "bg-purple-100 text-purple-700"

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1 ${colorClass}`}>
      {status === 'SCANNING' || status === 'PLANNING' ? <Loader2 size={10} className="animate-spin"/> : null}
      {status}
    </span>
  )
}