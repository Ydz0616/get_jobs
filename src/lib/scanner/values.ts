export function getElementValue(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === "select") {
      const select = element as HTMLSelectElement;
      const selectedOption = select.options[select.selectedIndex];
      return selectedOption?.text || select.value || "";
    }
    
    if (tagName === "textarea") {
      return (element as HTMLTextAreaElement).value || "";
    }
    
    if (tagName === "input") {
      const input = element as HTMLInputElement;
      const type = input.type?.toLowerCase() || "text";
      
      if (type === "checkbox" || type === "radio") {
        return input.checked ? "checked" : "unchecked";
      }
      
      if (type === "file") {
        const files = input.files;
        if (files && files.length > 0) {
          return Array.from(files).map(f => f.name).join(", ");
        }
        return "No file selected";
      }
      
      return input.value || "";
    }
    
    if (tagName === "button" || element.getAttribute("role") === "button") {
      return element.textContent?.trim() || "";
    }
    
    return "";
  }