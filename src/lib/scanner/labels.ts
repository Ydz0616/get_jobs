/**
 * Heuristic Logic to find labels for inputs
 */
export function findLabel(input: HTMLElement): string {
    const tagName = input.tagName.toLowerCase();
    
    // 1. Explicit Label (for="id")
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label?.textContent) {
        const text = label.textContent.trim();
        if (text.length > 0 && text.length < 150) return text;
      }
    }
  
    // 2. Accessibility Attributes
    const ariaLabel = input.getAttribute("aria-label");
    if (ariaLabel && ariaLabel.length < 150) return ariaLabel.trim();
    
    const ariaLabelledBy = input.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(/\s+/);
      let combinedLabel = "";
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el?.textContent) combinedLabel += el.textContent.trim() + " ";
      });
      if (combinedLabel.trim()) return combinedLabel.trim();
    }
  
    // 3. Workday / ATS Specific Attributes
    const automationId = input.getAttribute("data-automation-id");
    if (automationId) {
      const readable = automationId.split(/[_A-Z]/).filter(Boolean).join(" ");
      if (readable.length > 0 && readable.length < 100) return readable;
    }
    
    const dataLabel = input.getAttribute("data-label") || 
                      input.getAttribute("data-name") ||
                      input.getAttribute("data-field-name");
    if (dataLabel && dataLabel.length < 100) return dataLabel.trim();
  
    // 4. Previous Sibling Search
    let prev = input.previousElementSibling;
    for (let i = 0; i < 2; i++) {
      if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || 
                   prev.tagName === 'DIV' || prev.tagName === 'P' || prev.tagName.match(/^H[1-6]$/))) {
        const text = prev.textContent?.trim();
        if (text && text.length > 3 && text.length < 200 && !text.includes('\n')) {
          return text;
        }
      }
      if (prev) prev = prev.previousElementSibling;
    }
  
    // 5. Parent Container Search
    let parent = input.parentElement;
    let attempts = 0;
    while (parent && attempts < 4) {
      const labelInParent = parent.querySelector("label, .label, [class*='label'], [id*='label']");
      if (labelInParent?.textContent) {
        const text = labelInParent.textContent.trim();
        if (text.length > 0 && text.length < 150) return text;
      }
      
      const clone = parent.cloneNode(true) as HTMLElement;
      const inputsInClone = clone.querySelectorAll("input, select, textarea, button, [role='button'], [role='combobox']");
      inputsInClone.forEach(el => el.remove());
      
      const text = clone.innerText?.trim();
      if (text && text.length > 0) {
        const cleanText = text.replace(/[\r\n]+/g, " ").trim();
        if (cleanText.length > 3 && cleanText.length < 200) {
          if (!/^(form|field|input|select|required|optional|upload|attach|browse)$/i.test(cleanText)) {
            return cleanText;
          }
        }
      }
      parent = parent.parentElement;
      attempts++;
    }
  
    // 6. Placeholder
    if (tagName === "input" || tagName === "textarea") {
      const placeholder = input.getAttribute("placeholder");
      if (placeholder && placeholder.length < 100) return placeholder.trim();
    }
    
    // 7. Select First Option
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
    
    // 8. Button Text (Fallback)
    if (tagName === "button" || input.getAttribute("role") === "button") {
      const buttonText = input.textContent?.trim();
      if (buttonText && buttonText.length > 0 && buttonText.length < 100) {
        return buttonText.replace(/\s+/g, " ").substring(0, 50);
      }
    }
  
    // 9. File Upload Name
    if (tagName === "input" && input.getAttribute("type") === "file") {
      const name = input.getAttribute("name");
      if (name) {
        return name.split(/[-_]/).filter(Boolean).join(" ");
      }
      return "File Upload";
    }
  
    return "Unknown";
  }