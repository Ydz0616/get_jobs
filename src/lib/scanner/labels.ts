/**
 * Heuristic Logic to find labels for inputs
 */
export function findLabel(input: HTMLElement): string {
    const tagName = input.tagName.toLowerCase();
    
    // 0. Button special case: use own text
    if (tagName === "button" || input.getAttribute("role") === "button") {
      const buttonText = input.textContent?.trim();
      if (buttonText && buttonText.length > 0 && buttonText.length < 100) {
        return buttonText.replace(/\s+/g, " ").substring(0, 50);
      }
    }
    
    // 1. Explicit Label (for="id")
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label?.textContent) {
        const text = label.textContent.trim();
        if (text.length > 0 && text.length < 100) return text;
      }
    }
  
    // 2. Accessibility Attributes
    const ariaLabel = input.getAttribute("aria-label");
    if (ariaLabel && ariaLabel.length < 100) return ariaLabel.trim();
    
    const ariaLabelledBy = input.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement?.textContent) {
        const text = labelElement.textContent.trim();
        if (text.length > 0 && text.length < 100) return text;
      }
    }
  
    // 3. Placeholder
    if (tagName === "input" || tagName === "textarea") {
      const placeholder = input.getAttribute("placeholder");
      if (placeholder && placeholder.length < 100) return placeholder.trim();
    }
    
    // 4. Select First Option (Placeholder pattern)
    if (tagName === "select") {
      const select = input as HTMLSelectElement;
      if (select.options.length > 0) {
        const firstOption = select.options[0];
        if (firstOption.value === "" && firstOption.text) {
          const text = firstOption.text.trim();
          if (text.length > 0 && text.length < 100 && 
              !/^(select|choose|pick|please|--).*/i.test(text)) {
            return text;
          }
        }
      }
    }
  
    // 5. Workday / ATS Automation ID
    const automationId = input.getAttribute("data-automation-id");
    if (automationId) {
      const readable = automationId.split(/[_A-Z]/).filter(Boolean).join(" ");
      if (readable.length > 0 && readable.length < 100) return readable;
    }
    
    // Other data attributes
    const dataLabel = input.getAttribute("data-label") || 
                      input.getAttribute("data-name") ||
                      input.getAttribute("data-field-name");
    if (dataLabel && dataLabel.length < 100) return dataLabel.trim();
  
    // 6. Previous Sibling Search
    let prev = input.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || 
                 prev.tagName === 'DIV' || prev.tagName === 'P')) {
      const text = prev.textContent?.trim();
      if (text && text.length > 0 && text.length < 100 && !text.includes('\n')) {
        return text;
      }
    }
  
    // 7. Parent Container Search (Deep Traverse)
    let parent = input.parentElement;
    let attempts = 0;
    while (parent && attempts < 3) {
      // Check specific label classes
      const labelInParent = parent.querySelector("label, .label, [class*='label'], [id*='label']");
      if (labelInParent?.textContent) {
        const text = labelInParent.textContent.trim();
        if (text.length > 0 && text.length < 100) return text;
      }
      
      // Fallback: Clone and strip interactive elements to find remaining text
      const clone = parent.cloneNode(true) as HTMLElement;
      const inputsInClone = clone.querySelectorAll("input, select, textarea, button");
      inputsInClone.forEach(el => el.remove());
      
      const text = clone.innerText?.trim();
      if (text && text.length > 0 && text.length < 100 && !text.includes('\n')) {
        if (!/^(form|field|input|select|required|optional)$/i.test(text)) {
          return text;
        }
      }
      parent = parent.parentElement;
      attempts++;
    }
    
    // 8. File Upload Name Fallback
    if (tagName === "input" && input.getAttribute("type") === "file") {
      const name = input.getAttribute("name");
      if (name) {
        const readable = name.split(/[-_]/).filter(Boolean).join(" ");
        if (readable.length > 0) return readable;
      }
      return "File Upload";
    }
  
    return "Unknown";
  }