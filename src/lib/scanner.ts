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
 * 检查是否为上传相关的按钮
 */
function isUploadButton(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const text = element.textContent?.toLowerCase() || "";
  const ariaLabel = element.getAttribute("aria-label")?.toLowerCase() || "";
  const className = element.className?.toLowerCase() || "";
  const id = element.id?.toLowerCase() || "";
  
  // 检查文本内容
  const uploadKeywords = ["upload", "browse", "choose file", "select file", "attach", "resume", "cv"];
  const hasUploadText = uploadKeywords.some(keyword => 
    text.includes(keyword) || ariaLabel.includes(keyword) || className.includes(keyword) || id.includes(keyword)
  );
  
  // 检查是否为文件输入框的关联按钮
  const isFileInputRelated = element.closest("label")?.querySelector('input[type="file"]') !== null;
  
  return hasUploadText || isFileInputRelated;
}

/**
 * 检查是否为加号/添加按钮
 */
function isAddButton(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const text = element.textContent?.trim() || "";
  const ariaLabel = element.getAttribute("aria-label")?.toLowerCase() || "";
  const className = element.className?.toLowerCase() || "";
  const id = element.id?.toLowerCase() || "";
  
  // 检查文本内容
  const addKeywords = ["add", "new", "create", "insert", "append"];
  const hasAddText = addKeywords.some(keyword => 
    text.toLowerCase().includes(keyword) || ariaLabel.includes(keyword) || 
    className.includes(keyword) || id.includes(keyword)
  );
  
  // 检查是否包含加号符号
  const hasPlusSymbol = /^[\s]*\+[\s]*$/.test(text) || text === "+" || 
                       element.innerHTML.includes("+") ||
                       element.getAttribute("data-icon")?.includes("plus");
  
  // 检查常见的加号按钮类名
  const hasAddClass = /add|plus|insert|new|create/i.test(className) || 
                     /add|plus|insert|new|create/i.test(id);
  
  return hasAddText || hasPlusSymbol || hasAddClass;
}

/**
 * 检查是否为可交互的按钮元素（需要被识别）
 */
function isInteractiveButton(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  
  // 必须是 button 或可点击的元素
  if (tagName !== "button" && tagName !== "a" && 
      element.getAttribute("role") !== "button" &&
      !element.onclick) {
    return false;
  }
  
  // 排除提交和重置按钮（这些通常不需要自动点击）
  const type = element.getAttribute("type");
  if (type === "submit" || type === "reset") {
    return false;
  }
  
  // 检查是否为上传或添加按钮
  return isUploadButton(element) || isAddButton(element);
}

/**
 * 递归查找 Shadow DOM 内部的元素
 * 增强版：包含表单元素和可交互的按钮
 */
function getAllInputs(root: Document | ShadowRoot | HTMLElement): HTMLElement[] {
  const inputs: HTMLElement[] = [];
  
  // 1. 标准表单元素
  const currentInputs = root.querySelectorAll("input, select, textarea");
  currentInputs.forEach(el => inputs.push(el as HTMLElement));
  
  // 2. 查找可交互的按钮（上传、加号等）
  const buttons = root.querySelectorAll("button, a[role='button'], [role='button']");
  buttons.forEach(el => {
    const htmlEl = el as HTMLElement;
    if (isInteractiveButton(htmlEl)) {
      inputs.push(htmlEl);
    }
  });

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
 * 支持表单元素、下拉框、按钮等
 */
function findLabel(input: HTMLElement): string {
  const tagName = input.tagName.toLowerCase();
  
  // 对于按钮，优先使用按钮文本
  if (tagName === "button" || input.getAttribute("role") === "button") {
    const buttonText = input.textContent?.trim();
    if (buttonText && buttonText.length > 0 && buttonText.length < 100) {
      // 清理按钮文本（移除多余的空白和特殊字符）
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

  // 3. Placeholder (对于 input 和 textarea)
  if (tagName === "input" || tagName === "textarea") {
    const placeholder = input.getAttribute("placeholder");
    if (placeholder && placeholder.length < 100) return placeholder.trim();
  }
  
  // 4. Select 元素的特殊处理：查找第一个 option 的文本
  if (tagName === "select") {
    const select = input as HTMLSelectElement;
    if (select.options.length > 0) {
      const firstOption = select.options[0];
      // 如果第一个 option 是占位符（value 为空），可以用作 label
      if (firstOption.value === "" && firstOption.text) {
        const text = firstOption.text.trim();
        // 排除通用的 "Select..." 提示
        if (text.length > 0 && text.length < 100 && 
            !/^(select|choose|pick|please|--).*/i.test(text)) {
          return text;
        }
      }
    }
  }

  // 5. Workday / ATS Specific Attributes (The "Anti-Simplify" Logic)
  const automationId = input.getAttribute("data-automation-id");
  if (automationId) {
    // Workday IDs look like "legalNameSection_firstName"
    const readable = automationId.split(/[_A-Z]/).filter(Boolean).join(" ");
    if (readable.length > 0 && readable.length < 100) return readable;
  }
  
  // 其他常见的 data 属性
  const dataLabel = input.getAttribute("data-label") || 
                    input.getAttribute("data-name") ||
                    input.getAttribute("data-field-name");
  if (dataLabel && dataLabel.length < 100) return dataLabel.trim();

  // 6. Previous Sibling (Very common in simple forms)
  // <label>First Name</label> <input>
  let prev = input.previousElementSibling;
  if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || 
               prev.tagName === 'DIV' || prev.tagName === 'P')) {
    const text = prev.textContent?.trim();
    if (text && text.length > 0 && text.length < 100 && !text.includes('\n')) {
      return text;
    }
  }

  // 7. Parent Container Text (Fallback)
  // <div> <span class="label">Name</span> <input> </div>
  let parent = input.parentElement;
  let attempts = 0;
  while (parent && attempts < 3) {
    // 先检查是否有明确的 label 类或 id
    const labelInParent = parent.querySelector("label, .label, [class*='label'], [id*='label']");
    if (labelInParent?.textContent) {
      const text = labelInParent.textContent.trim();
      if (text.length > 0 && text.length < 100) return text;
    }
    
    // Clone to safely remove the input itself from text content
    const clone = parent.cloneNode(true) as HTMLElement;
    const inputsInClone = clone.querySelectorAll("input, select, textarea, button");
    inputsInClone.forEach(el => el.remove());
    
    const text = clone.innerText?.trim();
    // Check if text looks like a label (short, no newlines)
    if (text && text.length > 0 && text.length < 100 && !text.includes('\n')) {
      // 过滤掉常见的无用文本
      if (!/^(form|field|input|select|required|optional)$/i.test(text)) {
        return text;
      }
    }
    parent = parent.parentElement;
    attempts++;
  }
  
  // 8. 对于文件上传，使用 name 属性或类型
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

/**
 * 获取元素的值（支持不同类型）
 */
function getElementValue(element: HTMLElement): string {
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
    
    // 对于 checkbox 和 radio，返回 checked 状态
    if (type === "checkbox" || type === "radio") {
      return input.checked ? "checked" : "unchecked";
    }
    
    // 对于文件输入，返回文件名
    if (type === "file") {
      const files = input.files;
      if (files && files.length > 0) {
        return Array.from(files).map(f => f.name).join(", ");
      }
      return "No file selected";
    }
    
    return input.value || "";
  }
  
  // 对于按钮，返回按钮文本
  if (tagName === "button" || element.getAttribute("role") === "button") {
    return element.textContent?.trim() || "";
  }
  
  return "";
}

/**
 * 获取元素的类型标识
 */
function getElementType(element: HTMLElement): string {
  const tagName = element.tagName.toLowerCase();
  
  if (tagName === "input") {
    const type = element.getAttribute("type")?.toLowerCase() || "text";
    return type;
  }
  
  if (tagName === "select") {
    const select = element as HTMLSelectElement;
    return select.multiple ? "select-multiple" : "select";
  }
  
  if (tagName === "textarea") {
    return "textarea";
  }
  
  if (tagName === "button" || element.getAttribute("role") === "button") {
    if (isUploadButton(element)) {
      return "upload-button";
    }
    if (isAddButton(element)) {
      return "add-button";
    }
    return "button";
  }
  
  return tagName;
}

/**
 * 主扫描函数 - 增强版
 * 现在能识别：输入框、下拉框、勾选框、上传按钮、加号按钮等
 */
export function scanPageInputs(): ScannedField[] {
  const elements = getAllInputs(document);
  const validFields: ScannedField[] = [];

  elements.forEach((element) => {
    // Filter 1: Ignore hidden inputs
    if (element.getAttribute("type") === "hidden") return;
    
    // Filter 2: Ignore invisible elements (CSS)
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return;
    
    // 对于 opacity，只过滤完全透明的
    if (parseFloat(style.opacity) === 0) return;

    // Filter 3: Size check (放宽对按钮的限制)
    const rect = element.getBoundingClientRect();
    const tagName = element.tagName.toLowerCase();
    
    // 按钮和链接可以更小
    if (tagName === "button" || tagName === "a" || element.getAttribute("role") === "button") {
      if (rect.width < 5 || rect.height < 5) return;
    } else {
      // 其他元素保持 10px 限制
      if (rect.width < 10 || rect.height < 10) return;
    }

    const elementType = getElementType(element);
    const elementValue = getElementValue(element);
    const elementLabel = findLabel(element);

    validFields.push({
      id: element.id || `gen_${Math.random().toString(36).substring(2, 11)}`,
      type: elementType,
      label: elementLabel,
      value: elementValue,
      element: element // Crucial: Store reference for live positioning
    });
  });

  // 调试信息
  if (validFields.length > 0) {
    const selectCount = validFields.filter(f => f.type === "select" || f.type === "select-multiple").length;
    const buttonCount = validFields.filter(f => f.type.includes("button")).length;
    const fileCount = validFields.filter(f => f.type === "file" || f.type === "upload-button").length;
    const checkboxCount = validFields.filter(f => f.type === "checkbox").length;
    console.log(`📊 Scanner: Found ${validFields.length} fields (${selectCount} selects, ${checkboxCount} checkboxes, ${buttonCount} buttons, ${fileCount} file inputs)`);
  }

  return validFields;
}