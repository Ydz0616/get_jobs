/**
 * Shared Type Definitions for Scanner Module
 */

export interface ScannedField {
    id: string;
    type: string;
    label: string;
    value: string;
    element: HTMLElement; // Keep reference to element for live positioning
  }
  