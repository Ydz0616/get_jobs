import { useEffect, useRef } from "react"
import { useAgentStore } from "./machine"
import { storageService } from "./storage"
import { scanPageInputs } from "../lib/scanner"
import { isNextButton } from "../lib/scanner/classifiers"
import { injector } from "../lib/injector"
import { matchField } from "./matcher"
import type { UserProfile } from "./types"

/**
 * AgentLoop - The Brain
 * Coordinates: Vision (Scanner) -> Reflex (Matcher) -> Action (Injector)
 */
export const AgentLoop = () => {
  const { status, setStatus, addLog } = useAgentStore()
  const processing = useRef(false)
  const profileCache = useRef<UserProfile | null>(null)

  // Pre-load profile on mount
  useEffect(() => {
    storageService.getProfile().then(p => profileCache.current = p)
  }, [])

  useEffect(() => {
    if (status === "IDLE" || status === "STOPPED" || status === "SUCCESS") return

    const interval = setInterval(async () => {
      if (processing.current) return
      processing.current = true

      try {
        // --- PHASE 1: SCANNING (Observe) ---
        if (status === "SCANNING") {
          const fields = scanPageInputs()
          const emptyFields = fields.filter(f => {
            // Filter out hidden fields and fields that already have values
            if (f.type === 'hidden') return false
            // For checkbox/radio, check if they need to be set
            if (f.type === 'checkbox' || f.type === 'radio') {
              const input = f.element as HTMLInputElement
              return !input.checked // Only consider unchecked checkboxes/radios
            }
            // For select, check if something is selected
            if (f.type === 'select') {
              const select = f.element as HTMLSelectElement
              return select.selectedIndex === 0 && select.options[0]?.value === ""
            }
            // For text inputs, check if empty
            return !f.value || f.value.trim() === ""
          })
          
          if (emptyFields.length > 0 && profileCache.current) {
            // --- PHASE 2: EXECUTING (Act) ---
            let filledCount = 0
            for (const field of emptyFields) {
              // Try Reflex Matcher
              const match = matchField(field, profileCache.current)
              
              if (match && match.trim() !== "") {
                const success = await injector.fill(field.element, match)
                if (success) {
                  addLog(`Filled [${field.label}] with [${match}]`)
                  filledCount++
                  // Small delay to simulate human typing speed & allow React validation
                  await new Promise(r => setTimeout(r, 100)) 
                }
              }
            }

            if (filledCount > 0) {
              addLog(`Filled ${filledCount} fields. Re-scanning...`)
              // Wait a bit for DOM to update, then continue scanning
              await new Promise(r => setTimeout(r, 500))
              processing.current = false
              return
            } else {
              addLog("No matching data for remaining fields. Checking navigation...")
            }
          }

          // --- PHASE 3: NAVIGATION (Next) ---
          const buttons = document.querySelectorAll("button, a[role='button'], input[type='submit']")
          let nextBtn: HTMLElement | null = null
          
          for (let i = 0; i < buttons.length; i++) {
            if (isNextButton(buttons[i] as HTMLElement)) {
              nextBtn = buttons[i] as HTMLElement
              break
            }
          }

          if (nextBtn) {
            addLog(`Navigating: [${nextBtn.innerText || 'Next'}]`)
            setStatus("NAVIGATING")
            const clicked = await injector.click(nextBtn)
            
            if (clicked) {
              await new Promise(r => setTimeout(r, 3000)) // Wait for page load
              setStatus("SCANNING")
            } else {
              addLog("Navigation click failed.")
              setStatus("STOPPED")
            }
          } else {
            addLog("End of flow (No Next button).")
            setStatus("SUCCESS")
          }
        }
      } catch (e: any) {
        console.error(e)
        addLog(`Error: ${e.message}`)
        setStatus("STOPPED")
      } finally {
        processing.current = false
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [status, setStatus, addLog])

  return null
}