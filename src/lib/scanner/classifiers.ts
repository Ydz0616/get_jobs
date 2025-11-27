/**
 * Element Classification Logic
 * Identifies element types (Upload button, Add button, Interactive, etc.)
 */

/**
 * Check if element acts as an upload button
 */
export function isUploadButton(element: HTMLElement): boolean {
    const text = element.textContent?.toLowerCase() || "";
    const ariaLabel = element.getAttribute("aria-label")?.toLowerCase() || "";
    const className = element.className?.toLowerCase() || "";
    const id = element.id?.toLowerCase() || "";
    
    const uploadKeywords = ["upload", "browse", "choose file", "select file", "attach", "resume", "cv"];
    const hasUploadText = uploadKeywords.some(keyword => 
      text.includes(keyword) || ariaLabel.includes(keyword) || className.includes(keyword) || id.includes(keyword)
    );
    
    const isFileInputRelated = element.closest("label")?.querySelector('input[type="file"]') !== null;
    
    return hasUploadText || isFileInputRelated;
  }
  
  /**
   * Check if element acts as an "Add" button (e.g. Add Experience)
   */
  export function isAddButton(element: HTMLElement): boolean {
    const text = element.textContent?.trim() || "";
    const ariaLabel = element.getAttribute("aria-label")?.toLowerCase() || "";
    const className = element.className?.toLowerCase() || "";
    const id = element.id?.toLowerCase() || "";
    
    const addKeywords = ["add", "new", "create", "insert", "append"];
    const hasAddText = addKeywords.some(keyword => 
      text.toLowerCase().includes(keyword) || ariaLabel.includes(keyword) || 
      className.includes(keyword) || id.includes(keyword)
    );
    
    const hasPlusSymbol = /^[\s]*\+[\s]*$/.test(text) || text === "+" || 
                         element.innerHTML.includes("+") ||
                         element.getAttribute("data-icon")?.includes("plus");
    
    const hasAddClass = /add|plus|insert|new|create/i.test(className) || 
                       /add|plus|insert|new|create/i.test(id);
    
    return hasAddText || hasPlusSymbol || hasAddClass;
  }
  
  /**
   * Check if a non-form element is interactive enough to be scanned
   */
  export function isInteractiveButton(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    
    // Must be button-like
    if (tagName !== "button" && tagName !== "a" && 
        element.getAttribute("role") !== "button" &&
        !element.onclick) {
      return false;
    }
    
    // Exclude Submit/Reset (we don't autofill those)
    const type = element.getAttribute("type");
    if (type === "submit" || type === "reset") {
      return false;
    }
    
    return isUploadButton(element) || isAddButton(element);
  }
  
  /**
   * Determine the semantic type of the element
   */
  export function getElementType(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === "input") {
      return element.getAttribute("type")?.toLowerCase() || "text";
    }
    
    if (tagName === "select") {
      return (element as HTMLSelectElement).multiple ? "select-multiple" : "select";
    }
    
    if (tagName === "textarea") {
      return "textarea";
    }
    
    if (tagName === "button" || element.getAttribute("role") === "button") {
      if (isUploadButton(element)) return "upload-button";
      if (isAddButton(element)) return "add-button";
      return "button";
    }
    
    return tagName;
  }