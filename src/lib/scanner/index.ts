import { getAllInputs } from "./traversal";
import { getElementType } from "./classifiers";
import { findLabel } from "./labels";
import { getElementValue } from "./values";
import type { ScannedField } from "./types";

export type { ScannedField } from "./types";

/**
 * Main Scanning Function
 * Orchestrates traversal, classification, label extraction, and value extraction.
 */
export function scanPageInputs(): ScannedField[] {
  const elements = getAllInputs(document);
  const validFields: ScannedField[] = [];

  elements.forEach((element) => {
    // 1. Basic Visibility Filter
    if (element.getAttribute("type") === "hidden") return;
    
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return;
    
    if (parseFloat(style.opacity) === 0) return;

    // 2. Size Check
    const rect = element.getBoundingClientRect();
    const tagName = element.tagName.toLowerCase();
    
    // Buttons can be smaller, but standard inputs usually aren't tiny
    const minSize = (tagName === "button" || tagName === "a" || element.getAttribute("role") === "button") ? 5 : 10;
    
    if (rect.width < minSize || rect.height < minSize) return;

    // 3. Assemble Field Data
    const elementType = getElementType(element);
    const elementValue = getElementValue(element);
    const elementLabel = findLabel(element);

    validFields.push({
      id: element.id || `gen_${Math.random().toString(36).substring(2, 11)}`,
      type: elementType,
      label: elementLabel,
      value: elementValue,
      element: element // Reference for live positioning
    });
  });

  // Debug Stats
  if (validFields.length > 0) {
    const stats = validFields.reduce((acc, field) => {
      acc[field.type] = (acc[field.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`📊 Scanner Stats:`, stats);
  }

  return validFields;
}