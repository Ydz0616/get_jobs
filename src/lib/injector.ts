/**
 * Injector Utility
 * Handles direct DOM interactions safely, specifically designed to bypass
 * React's controlled component restrictions (Shadow DOM compatible).
 */
export const injector = {
  /**
   * Clicks an element after scrolling it into view.
   */
  click: async (element: HTMLElement): Promise<boolean> => {
    try {
      if (!element || element.getAttribute("disabled") !== null) return false
      
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      await new Promise(r => setTimeout(r, 500)) 

      element.click()
      return true
    } catch (e) {
      console.error("Click failed", e)
      return false
    }
  },

  /**
   * Fills a form field with a value, supporting all input types.
   * This uses native setters to bypass React's virtual DOM state blocking.
   */
  fill: async (element: HTMLElement, value: string): Promise<boolean> => {
    try {
      if (!element) return false
      
      const tag = element.tagName.toLowerCase()
      element.focus()

      // --- SELECT (Dropdown) ---
      if (tag === "select") {
        const select = element as HTMLSelectElement
        const valueLower = value.toLowerCase().trim()
        
        // Try to find option by value or text
        for (let i = 0; i < select.options.length; i++) {
          const option = select.options[i]
          const optionValue = option.value.toLowerCase().trim()
          const optionText = option.text.toLowerCase().trim()
          
          if (optionValue === valueLower || optionText === valueLower || 
              optionText.includes(valueLower) || valueLower.includes(optionText)) {
            select.selectedIndex = i
            
            // Trigger events
            select.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }))
            select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }))
            return true
          }
        }
        return false
      }

      // --- CHECKBOX ---
      if (tag === "input" && (element as HTMLInputElement).type === "checkbox") {
        const checkbox = element as HTMLInputElement
        const shouldCheck = value.toLowerCase().includes("yes") || 
                           value.toLowerCase().includes("true") ||
                           value.toLowerCase().includes("check") ||
                           value === "1"
        
        if (checkbox.checked !== shouldCheck) {
          checkbox.checked = shouldCheck
          checkbox.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }))
          checkbox.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }))
        }
        return true
      }

      // --- RADIO ---
      if (tag === "input" && (element as HTMLInputElement).type === "radio") {
        const radio = element as HTMLInputElement
        const valueLower = value.toLowerCase().trim()
        const radioValue = (radio.value || "").toLowerCase().trim()
        const radioName = radio.name
        
        // Check if this radio matches the value
        if (radioValue === valueLower || radioValue.includes(valueLower) || valueLower.includes(radioValue)) {
          radio.checked = true
          radio.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }))
          radio.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }))
          return true
        }
        return false
      }

      // --- TEXT / TEXTAREA / EMAIL / TEL / NUMBER ---
      if (tag === "input" || tag === "textarea") {
        const proto = tag === "textarea" 
          ? window.HTMLTextAreaElement.prototype 
          : window.HTMLInputElement.prototype

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set
        
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(element, value)
        } else {
          (element as HTMLInputElement | HTMLTextAreaElement).value = value
        }

        // Dispatch events
        const events = ["input", "change", "blur"]
        for (const eventType of events) {
          const event = new Event(eventType, { bubbles: true, cancelable: true })
          element.dispatchEvent(event)
        }
        return true
      }

      return false
    } catch (e) {
      console.error("Injection failed", e)
      return false
    }
  }
}