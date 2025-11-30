/**
 * Injector Utility
 * Handles direct DOM interactions safely.
 */
export const injector = {
    /**
     * Clicks an element after scrolling it into view.
     */
    click: async (element: HTMLElement): Promise<boolean> => {
      try {
        if (!element || element.getAttribute("disabled") !== null) return false
        
        // Scroll into view to handle lazy-loaded elements or anti-bot checks
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        
        // Wait for scroll animation to finish
        await new Promise(r => setTimeout(r, 500)) 
  
        // Dispatch native click
        element.click()
        
        return true
      } catch (e) {
        console.error("Click failed", e)
        return false
      }
    }
  }