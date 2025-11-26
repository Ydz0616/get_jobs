/**
 * DOM Scanner Strategy - Enhanced
 * Location: src/lib/scanner.ts
 */

export interface ScannedField {
  id: string;
  type: string;
  label: string;
  value: string;
  element: HTMLElement; // Keep reference to element for live positioning
}

/**
 * 递归查找 Shadow DOM 内部的元素
 */
function getAllInputs(root: Document | ShadowRoot | HTMLElement): HTMLElement[] {
  const inputs: HTMLElement[] = [];
  
  const currentInputs = root.querySelectorAll("input, select, textarea");
  currentInputs.forEach(el => inputs.push(el as HTMLElement));

  // 确定 TreeWalker 的根节点
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
    // 如果 TreeWalker 失败（某些边界情况），至少返回已找到的输入
    console.warn("TreeWalker failed, using fallback:", error);
  }

  return inputs;
}

/**
 * 增强版 Label 查找器
 */
function findLabel(input: HTMLElement): string {
  // 1. Explicit Label (for="id")
  if (input.id) {
    // Note: document.querySelector might fail across shadow boundaries
    // but it's still the best first try.
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label?.textContent) return label.textContent.trim();
  }

  // 2. Accessibility Attributes
  const ariaLabel = input.getAttribute("aria-label") || input.getAttribute("aria-labelledby");
  if (ariaLabel && ariaLabel.length < 50) return ariaLabel.trim(); // Avoid long garbage strings

  // 3. Placeholder
  const placeholder = input.getAttribute("placeholder");
  if (placeholder) return placeholder.trim();

  // 4. Workday / ATS Specific Attributes (The "Anti-Simplify" Logic)
  const automationId = input.getAttribute("data-automation-id");
  if (automationId) {
    // Workday IDs look like "legalNameSection_firstName"
    // We can split by underscore or camelCase to make it readable
    return automationId.split(/[_A-Z]/).pop() || automationId;
  }

  // 5. Previous Sibling (Very common in simple forms)
  // <label>First Name</label> <input>
  let prev = input.previousElementSibling;
  if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'DIV')) {
    const text = prev.textContent?.trim();
    if (text && text.length > 0 && text.length < 50) return text;
  }

  // 6. Parent Container Text (Fallback)
  // <div> <span class="label">Name</span> <input> </div>
  let parent = input.parentElement;
  let attempts = 0;
  while (parent && attempts < 2) {
    // Clone to safely remove the input itself from text content
    const clone = parent.cloneNode(true) as HTMLElement;
    const inputsInClone = clone.querySelectorAll("input, select, textarea");
    inputsInClone.forEach(el => el.remove());
    
    const text = clone.innerText?.trim();
    // Check if text looks like a label (short, no newlines)
    if (text && text.length > 0 && text.length < 50 && !text.includes('\n')) {
      return text;
    }
    parent = parent.parentElement;
    attempts++;
  }

  return "Unknown";
}

export function scanPageInputs(): ScannedField[] {
  const elements = getAllInputs(document);
  const validFields: ScannedField[] = [];

  elements.forEach((element) => {
    // Filter 1: Ignore hidden inputs
    if (element.getAttribute("type") === "hidden") return;
    
    // Filter 2: Ignore invisible elements (CSS)
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return;

    // Filter 3: Size check (Ignore 1x1 tracking pixels)
    const rect = element.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;

    validFields.push({
      id: element.id || `gen_${Math.random().toString(36).substring(2, 11)}`,
      type: element.tagName.toLowerCase() === "input" 
        ? element.getAttribute("type") || "text" 
        : element.tagName.toLowerCase(),
      label: findLabel(element),
      value: (element as HTMLInputElement).value || "",
      element: element // Crucial: Store reference for live positioning
    });
  });

  return validFields;
}