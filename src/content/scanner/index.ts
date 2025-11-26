/**
 * DOM Scanner Module
 * Location: src/content/scanner/index.ts
 * Purpose: Scan the page and extract semantic input fields.
 * This is the "Eyes" of our agent.
 */

export interface ScannedField {
    id: string;           // Unique ID or Selector
    type: string;         // 'text', 'email', 'select', 'checkbox', etc.
    label: string;        // Semantic label (e.g., "First Name")
    value: string;        // Current value
    rect: DOMRect;        // Position for highlighting (UI feedback)
    element: HTMLElement; // Reference to the actual DOM node
  }
  
  /**
   * Heuristic function to find the best label for an input.
   * Looks for <label> tags, aria-labels, or nearby text.
   */
  function findLabel(input: HTMLElement): string {
    // 1. Check explicit label tag (id association)
    // Example: <label for="email">Email</label>
    if (input.id) {
      const labelElement = document.querySelector(`label[for="${input.id}"]`);
      if (labelElement?.textContent) return labelElement.textContent.trim();
    }
  
    // 2. Check aria-label attribute (Accessibility standard)
    const ariaLabel = input.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel.trim();
  
    // 3. Check placeholder attribute
    const placeholder = input.getAttribute("placeholder");
    if (placeholder) return placeholder.trim();
  
    // 4. (Fallback) Look at parent text content (common in divs)
    // Simple heuristic: get text from parent but exclude own value
    const parentText = input.parentElement?.innerText;
    if (parentText && parentText.length < 50) return parentText.trim();
  
    // 5. If all fails, mark as unknown
    return "Unknown Field";
  }
  
  /**
   * Main Scanning Function
   * Traverses the DOM to find interactive elements.
   * NOTE: Shadow DOM traversal will be added later for Workday strategies.
   */
  export function scanPageInputs(): ScannedField[] {
    const inputs: ScannedField[] = [];
    
    // Select all common input elements
    // We include 'textarea' for open questions like "Why Us?"
    const elements = document.querySelectorAll("input, select, textarea");
  
    elements.forEach((el) => {
      const element = el as HTMLElement;
      
      // Skip hidden or invisible inputs to avoid ghost fills
      if (element.offsetParent === null) return;
      if (element.getAttribute("type") === "hidden") return;
  
      // Determine the type
      const type = element.tagName.toLowerCase() === "input" 
        ? element.getAttribute("type") || "text" 
        : element.tagName.toLowerCase();
  
      // Generate a temporary ID if none exists (for React apps)
      const uniqueId = element.id || `generated_${Math.random().toString(36).substr(2, 9)}`;
  
      inputs.push({
        id: uniqueId,
        type,
        label: findLabel(element),
        value: (element as HTMLInputElement).value || "",
        rect: element.getBoundingClientRect(), // Capture position for UI overlay
        element
      });
    });
  
    return inputs;
  }