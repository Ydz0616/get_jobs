import { getAllInputs } from "./traversal";
import { getElementType } from "./classifiers";
import { findLabel } from "./labels";
import { getElementValue } from "./values";
import type { ScannedField } from "./types";

export type { ScannedField } from "./types";

export function scanPageInputs(): ScannedField[] {
  const elements = getAllInputs(document);
  const validFields: ScannedField[] = [];

  elements.forEach((element) => {
    // Visibility Check
    if (element.getAttribute("type") === "hidden") return;
    
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return;
    if (parseFloat(style.opacity) === 0) return;

    // Size Check
    const rect = element.getBoundingClientRect();
    const tagName = element.tagName.toLowerCase();
    
    // Buttons can be smaller than inputs
    const minSize = (tagName === "button" || tagName === "a" || element.getAttribute("role") === "button") ? 5 : 10;
    
    if (rect.width < minSize || rect.height < minSize) return;

    const elementType = getElementType(element);
    const elementValue = getElementValue(element);
    const elementLabel = findLabel(element);

    validFields.push({
      id: element.id || `gen_${Math.random().toString(36).substring(2, 11)}`,
      type: elementType,
      label: elementLabel,
      value: elementValue,
      element: element 
    });
  });

  return validFields;
}