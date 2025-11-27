import { isInteractiveButton } from "./classifiers";

export function getAllInputs(root: Document | ShadowRoot | HTMLElement): HTMLElement[] {
  const inputs: HTMLElement[] = [];
  
  // 1. Standard Form Elements + Custom Roles
  const selector = "input, select, textarea, [role='combobox'], [role='listbox'], [contenteditable='true']";
  const currentInputs = root.querySelectorAll(selector);
  currentInputs.forEach(el => inputs.push(el as HTMLElement));
  
  // 2. Interactive Buttons (Explicitly scan for buttons)
  const buttons = root.querySelectorAll("button, a[role='button'], [role='button']");
  buttons.forEach(el => {
    const htmlEl = el as HTMLElement;
    if (isInteractiveButton(htmlEl)) {
      inputs.push(htmlEl);
    }
  });

  // 3. TreeWalker for Shadow DOM
  let walkerRoot: Node;
  if (root instanceof Document) {
    walkerRoot = root.body || root;
  } else {
    walkerRoot = root as Node;
  }

  try {
    const walker = document.createTreeWalker(
      walkerRoot,
      NodeFilter.SHOW_ELEMENT,
      null
    );

    while (walker.nextNode()) {
      const el = walker.currentNode as HTMLElement;
      if (el?.shadowRoot) {
        inputs.push(...getAllInputs(el.shadowRoot));
      }
    }
  } catch (error) {
    console.warn("TreeWalker failed:", error);
  }

  return inputs;
}