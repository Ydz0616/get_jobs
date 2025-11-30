import type { UserProfile } from "./types"
import type { ScannedField } from "../lib/scanner/types"

/**
 * Reflex Matcher
 * A deterministic rule-based engine to map DOM labels to Profile Data.
 * This runs locally and instantly (O(1)) without costing API credits.
 */
export function matchField(field: ScannedField, profile: UserProfile): string | null {
  const label = field.label.toLowerCase().replace(/[^a-z0-9]/g, "")
  const type = field.type
  const { basics, legal, preferences } = profile

  // --- 1. Basic Info Strategy ---
  
  // First Name
  if (label.includes("firstname") || label === "first" || label.includes("givenname")) {
    return basics.firstName
  }

  // Last Name
  if (label.includes("lastname") || label === "last" || label.includes("familyname") || label.includes("surname")) {
    return basics.lastName
  }

  // Full Name
  if (label === "name" || label.includes("fullname")) {
    return basics.fullName || `${basics.firstName} ${basics.lastName}`
  }

  // Email
  if (label.includes("email")) {
    return basics.email
  }

  // Phone
  if (label.includes("phone") || label.includes("mobile") || label.includes("contact")) {
    return basics.phone
  }

  // LinkedIn
  if (label.includes("linkedin")) {
    return basics.urls.linkedin || ""
  }

  // Portfolio / Website
  if (label.includes("website") || label.includes("portfolio") || label.includes("url")) {
    return basics.urls.portfolio || basics.urls.github || ""
  }

  // --- 2. Location Strategy ---
  
  if (label.includes("address") && !label.includes("email")) return basics.location.address
  if (label.includes("city")) return basics.location.city
  if (label.includes("zip") || label.includes("postal")) return basics.location.zipCode
  if (label.includes("state") || label.includes("province")) return basics.location.state
  if (label.includes("country")) return basics.location.country

  // --- 3. Legal & Visa Status ---
  
  // Citizenship
  if (label.includes("citizenship") || label.includes("citizen")) {
    return legal.citizenshipStatus
  }

  // Visa Type
  if (label.includes("visatype") || label.includes("visastatus") || label.includes("visa")) {
    return legal.visaStatus.type
  }

  // Work Authorization
  if (label.includes("authorizedtowork") || label.includes("workauthorization") || 
      label.includes("authorized") || (label.includes("work") && label.includes("author"))) {
    return legal.visaStatus.workAuthorization.authorized ? "Yes" : "No"
  }

  // Work Authorization Type
  if (label.includes("workauthtype") || label.includes("workpermittype")) {
    return legal.visaStatus.workAuthorization.type
  }

  // Sponsorship - Now
  if (label.includes("sponsorshipnow") || label.includes("requiresponsorshipnow") || 
      (label.includes("sponsor") && label.includes("now"))) {
    return legal.visaStatus.sponsorship.requireNow ? "Yes" : "No"
  }

  // Sponsorship - Future
  if (label.includes("sponsorshipfuture") || label.includes("requiresponsorshipfuture") ||
      (label.includes("sponsor") && (label.includes("future") || label.includes("will")))) {
    return legal.visaStatus.sponsorship.requireFuture ? "Yes" : "No"
  }

  // General Sponsorship (ambiguous - prefer future)
  if (label.includes("sponsorship") || label.includes("requiresponsor")) {
    return legal.visaStatus.sponsorship.requireFuture ? "Yes" : "No"
  }

  // Demographics
  if (label.includes("gender")) return legal.demographics.gender
  if (label.includes("race") || label.includes("ethnicity")) return legal.demographics.race
  if (label.includes("veteran")) return legal.demographics.veteran
  if (label.includes("disability")) return legal.demographics.disability

  // --- 4. Preferences ---
  
  // Salary
  if (label.includes("salary") || label.includes("compensation") || label.includes("pay")) {
    return preferences.salary.expected > 0 ? preferences.salary.expected.toString() : ""
  }

  // Remote Work
  if (label.includes("remote") || label.includes("workfromhome")) {
    return preferences.location.remote ? "Yes" : "No"
  }

  // Onsite Work
  if (label.includes("onsite") || label.includes("office")) {
    return preferences.location.onsite ? "Yes" : "No"
  }

  // Relocation
  if (label.includes("relocation") || label.includes("willingtorelocate")) {
    return preferences.location.relocation ? "Yes" : "No"
  }

  // Start Date
  if (label.includes("startdate") || label.includes("available") || label.includes("availability")) {
    return preferences.startDate
  }

  // --- 5. Education (simplified - return most recent) ---
  if (label.includes("school") || label.includes("university") || label.includes("college")) {
    if (profile.education.length > 0) {
      return profile.education[profile.education.length - 1].schoolName
    }
  }

  if (label.includes("degree")) {
    if (profile.education.length > 0) {
      return profile.education[profile.education.length - 1].degree
    }
  }

  if (label.includes("major") || label.includes("fieldofstudy")) {
    if (profile.education.length > 0) {
      return profile.education[profile.education.length - 1].major
    }
  }

  if (label.includes("gpa")) {
    if (profile.education.length > 0 && profile.education[profile.education.length - 1].gpa) {
      return profile.education[profile.education.length - 1].gpa!
    }
  }

  // --- 6. Experience (simplified - return most recent) ---
  if (label.includes("company") || label.includes("employer")) {
    if (profile.experience.length > 0) {
      return profile.experience[profile.experience.length - 1].companyName
    }
  }

  if (label.includes("position") || label.includes("title") || label.includes("jobtitle")) {
    if (profile.experience.length > 0) {
      return profile.experience[profile.experience.length - 1].positionTitle
    }
  }

  return null
}