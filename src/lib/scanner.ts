export interface ScannedField {
    id: string;
    type: string;
    label: string;
    value: string;
    rect: DOMRect;
    element: HTMLElement;
  }
  
  function findLabel(input: HTMLElement): string {
    if (input.id) {
      const labelElement = document.querySelector(`label[for="${input.id}"]`);
      if (labelElement?.textContent) return labelElement.textContent.trim();
    }
    const ariaLabel = input.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel.trim();
    const placeholder = input.getAttribute("placeholder");
    if (placeholder) return placeholder.trim();
    const parentText = input.parentElement?.innerText;
    if (parentText && parentText.length < 50) return parentText.trim();
    return "Unknown";
  }
  
  export function scanPageInputs(): ScannedField[] {
    const inputs: ScannedField[] = [];
    const elements = document.querySelectorAll("input, select, textarea");
  
    elements.forEach((el) => {
      const element = el as HTMLElement;
      if (element.offsetParent === null) return;
      if (element.getAttribute("type") === "hidden") return;
  
      inputs.push({
        id: element.id || `gen_${Math.random().toString(36).substr(2, 9)}`,
        type: element.tagName.toLowerCase(),
        label: findLabel(element),
        value: (element as HTMLInputElement).value || "",
        rect: element.getBoundingClientRect(),
        element
      });
    });
  
    return inputs;
  }