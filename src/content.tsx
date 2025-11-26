import { useEffect, useState } from "react"
import type { PlasmoCSConfig } from "plasmo"
import { scanPageInputs, type ScannedField } from "./lib/scanner"

// Plasmo Configuration: Run on all URLs
// This ensures the script injects into every page you visit
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true // Important for iframes (some job boards use them)
}

/**
 * Overlay UI Component
 * Draws a red border around detected inputs to visualize what the Agent sees.
 * This is primarily for Debugging & User Confidence during the Alpha phase.
 */
const ContentOverlay = () => {
  const [fields, setFields] = useState<ScannedField[]>([])

  useEffect(() => {
    // We use a timeout to wait for the page to fully hydrate (React/Vue apps).
    // In production, we might use a MutationObserver instead.
    const timer = setTimeout(() => {
      console.log("🤖 UCSD Job Agent: Scanning DOM...")
      
      const detected = scanPageInputs()
      
      console.log(`👁️ Found ${detected.length} interactive fields:`, detected)
      setFields(detected)
    }, 1500) // 1.5s delay

    return () => clearTimeout(timer)
  }, [])

  // If nothing found, render nothing
  if (fields.length === 0) return null

  return (
    <div 
      id="ucsd-job-agent-overlay" 
      style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%", 
        pointerEvents: "none", // Click-through: Don't block user interaction
        zIndex: 99999 
      }}
    >
      {fields.map((field) => (
        <div
          key={field.id}
          style={{
            position: "absolute",
            // Calculate absolute position based on scroll + rect
            left: field.rect.left + window.scrollX,
            top: field.rect.top + window.scrollY,
            width: field.rect.width,
            height: field.rect.height,
            border: "2px solid rgba(255, 0, 0, 0.5)", // Semi-transparent red
            borderRadius: "4px",
            backgroundColor: "rgba(255, 0, 0, 0.05)"
          }}
        >
          {/* Label Tag for Debugging */}
          <span style={{ 
            position: "absolute", 
            top: -20, 
            left: 0, 
            background: "red", 
            color: "white", 
            fontSize: "10px", 
            padding: "2px 4px",
            borderRadius: "2px",
            whiteSpace: "nowrap",
            zIndex: 100000,
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
          }}>
            {field.label.substring(0, 20)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ContentOverlay