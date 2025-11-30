import { useEffect, useRef } from "react"
import { useAgentStore } from "./machine"
import { scanPageInputs } from "../lib/scanner"
import { isNextButton } from "../lib/scanner/classifiers"
import { injector } from "../lib/injector"

/**
 * AgentLoop Component
 * Acts as the heartbeat of the agent, executing the OODA Loop.
 */
export const AgentLoop = () => {
  const { status, setStatus, addLog } = useAgentStore()
  const processing = useRef(false)

  useEffect(() => {
    // Only run loop if the agent is active
    if (status === "IDLE" || status === "STOPPED" || status === "SUCCESS") return

    const interval = setInterval(async () => {
      if (processing.current) return
      processing.current = true

      try {
        // --- PHASE: SCANNING (Observe) ---
        if (status === "SCANNING") {
          const inputs = scanPageInputs()
          
          // Find potential navigation buttons
          const buttons = document.querySelectorAll("button, a[role='button'], input[type='submit']")
          let nextBtn: HTMLElement | null = null
          
          // Identify the 'Next' button using classifiers
          for (let i = 0; i < buttons.length; i++) {
            if (isNextButton(buttons[i] as HTMLElement)) {
              nextBtn = buttons[i] as HTMLElement
              break
            }
          }

          if (nextBtn) {
            addLog(`Found navigation button: [${nextBtn.innerText || 'Next'}]`)
            setStatus("NAVIGATING")
            
            // Perform the click action
            const clicked = await injector.click(nextBtn)
            
            if (clicked) {
              addLog("Clicked Next. Waiting for page load...")
              // Wait briefly to allow page transition (Mocking Observer logic)
              await new Promise(r => setTimeout(r, 3000))
              setStatus("SCANNING") // Loop back to Scanning
            } else {
              addLog("Failed to click button (blocked or hidden)")
              setStatus("FIXING")
            }
          } else {
            // No navigation button found. Future logic: Check for form inputs to fill.
            if (inputs.length > 0) {
               // addLog(`Found ${inputs.length} inputs. Planning phase...`)
            }
          }
        }
      } catch (e: any) {
        console.error(e)
        addLog(`Error: ${e.message}`)
        setStatus("STOPPED")
      } finally {
        processing.current = false
      }
    }, 1500) // 1.5s heartbeat interval

    return () => clearInterval(interval)
  }, [status, setStatus, addLog])

  return null // Logic only, no UI
}