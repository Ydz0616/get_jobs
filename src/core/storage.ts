import type { UserProfile, AppSettings } from "./types"

/**
 * Storage Keys Enum
 * Prevents typos when accessing local storage.
 */
export enum StorageKey {
  PROFILE = "user_profile",
  STORY_BANK = "story_bank",
  SETTINGS = "app_settings"
}

// Default empty profile structure to prevent crashes on first load
// Partial is not recursive, so we must provide all required fields in nested objects like 'basics'
const DEFAULT_PROFILE: UserProfile = {
  meta: { version: "1.0.0", lastUpdated: Date.now() },
  basics: {
    firstName: "", 
    lastName: "", 
    firstNameNative: "",
    lastNameNative: "",
    preferredName: "", 
    fullName: "", 
    email: "", 
    phone: "",
    phoneType: "Mobile",
    location: { address: "", city: "", state: "", zipCode: "", country: "United States" },
    urls: {}
  },
  education: [],
  experience: [],
  legal: {
    citizenshipStatus: "Foreign National",
    visaStatus: {
      type: "F-1",
      sponsorship: { requireNow: false, requireFuture: true },
      workAuthorization: { authorized: true, type: "OPT" }
    },
    demographics: {
      gender: "Decline to identify",
      race: "Decline to identify",
      veteran: "Decline to identify",
      disability: "Decline to identify"
    }
  },
  preferences: {
    salary: { expected: 0, currency: "USD" },
    location: { remote: true, onsite: true, relocation: true },
    startDate: "Immediate"
  }
}

/**
 * Storage Service
 * Wraps chrome.storage.local with type-safe methods.
 * This is the single source of truth for the extension's memory.
 */
export const storageService = {
  // --- User Profile Operations ---
  
  /**
   * Retrieves the full user profile from storage.
   * Returns a default skeleton if no profile exists.
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const result = await chrome.storage.local.get(StorageKey.PROFILE)
      return (result[StorageKey.PROFILE] as UserProfile) || (DEFAULT_PROFILE as UserProfile)
    } catch (error) {
      console.error("Failed to retrieve profile:", error)
      return DEFAULT_PROFILE as UserProfile
    }
  },

  /**
   * Saves or updates the user profile.
   * Automatically updates the 'lastUpdated' timestamp.
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      const updatedProfile = {
        ...profile,
        meta: { ...profile.meta, lastUpdated: Date.now() }
      }
      await chrome.storage.local.set({ [StorageKey.PROFILE]: updatedProfile })
      console.log("✅ Profile saved successfully")
    } catch (error) {
      console.error("Failed to save profile:", error)
    }
  },

  // --- Settings Operations ---

  async getSettings(): Promise<AppSettings> {
    const result = await chrome.storage.local.get(StorageKey.SETTINGS)
    return (result[StorageKey.SETTINGS] as AppSettings) || { 
      model: "gpt-4o-mini", 
      language: "en",
      autoSubmit: false
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await chrome.storage.local.set({ [StorageKey.SETTINGS]: settings })
  },
  
  // --- Maintenance ---

  async clearAll(): Promise<void> {
    await chrome.storage.local.clear()
    console.warn("⚠️ Storage cleared completely")
  }
}