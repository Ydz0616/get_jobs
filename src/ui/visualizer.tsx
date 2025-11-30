import React, { useEffect, useState, useRef, useCallback } from "react"
import { scanPageInputs, type ScannedField } from "../lib/scanner"

/**
 * Visualizer Component
 * Draws colored boxes around detected inputs for debugging.
 * Extracted from content script to keep the entry point clean.
 */
export const Visualizer = () => {
  const [fields, setFields] = useState<ScannedField[]>([])
  const scanning = useRef(false)

  const triggerScan = useCallback(() => {
    if (scanning.current) return
    scanning.current = true
    
    requestAnimationFrame(() => {
      const detected = scanPageInputs()
      setFields(detected)
      scanning.current = false
    })
  }, [])

  // Monitor DOM mutations to keep the overlay in sync
  useEffect(() => {
    triggerScan()
    const interval = setInterval(triggerScan, 1000)
    
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false
      for (const m of mutations) if (m.addedNodes.length > 0) shouldScan = true
      if (shouldScan) triggerScan()
    })
    
    if (document.body) observer.observe(document.body, { childList: true, subtree: true })
    
    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [triggerScan])

  if (fields.length === 0) return null

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[2147483646]">
      {fields.map((field) => {
        const rect = field.element.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return null 
        
        // Color logic: Orange for buttons, Red for inputs
        const isBtn = field.type.includes('button')
        const color = isBtn ? '#f59e0b' : '#ef4444'

        return (
          <div
            key={field.id}
            style={{
              position: "absolute",
              left: rect.left + window.scrollX,
              top: rect.top + window.scrollY,
              width: rect.width,
              height: rect.height,
              border: `2px solid ${color}`,
              backgroundColor: `${color}10`,
              borderRadius: "4px",
              transition: "all 0.1s"
            }}
          />
        )
      })}
    </div>
  )
}