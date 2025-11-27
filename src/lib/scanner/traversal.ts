import { isInteractiveButton } from "./classifiers";

/**
 * Recursive function to find all interactive elements inside Shadow DOMs
 */
export function getAllInputs(root: Document | ShadowRoot | HTMLElement): HTMLElement[] {
  const inputs: HTMLElement[] = [];
  
  // 1. Standard Form Elements
  const currentInputs = root.querySelectorAll("input, select, textarea");
  currentInputs.forEach(el => inputs.push(el as HTMLElement));
  
  // 2. Interactive Buttons (Upload/Add)
  const buttons = root.querySelectorAll("button, a[role='button'], [role='button']");
  buttons.forEach(el => {
    const htmlEl = el as HTMLElement;
    if (isInteractiveButton(htmlEl)) {
      inputs.push(htmlEl);
    }
  });

  // 3. TreeWalker for Deep Traversal (Shadow DOMs)
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
        // Recursive call for nested Shadow Roots
        inputs.push(...getAllInputs(el.shadowRoot));
      }
    }
  } catch (error) {
    console.warn("TreeWalker failed, using fallback:", error);
  }

  return inputs;
}