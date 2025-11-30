/**
 * UCSD Job Copilot - Master Type Definitions
 * Version: 1.0.0
 * * This file defines the core data structures used throughout the application.
 * * CORE STRATEGY:
 * Unlike regex-based fillers (e.g., Simplify), our autofill logic relies on 
 * LLM reasoning. Therefore, the data structure here is designed to provide 
 * rich context (Context-Aware) rather than just flat key-value pairs.
 */

// ==========================================
// 1. User Profile (The Context for LLM)
// ==========================================

export interface UserProfile {
    meta: {
      version: string;
      lastUpdated: number; // Unix timestamp
    };
  
    // --- Basic Information (Hard Data) ---
    // Used for direct input filling
    basics: {
      // English names
      firstName: string;
      lastName: string;
      fullName: string; // Some forms require full name in one field
      
      // Native alphabet names (for international students)
      firstNameNative?: string;
      lastNameNative?: string;
      
      // Preferred name
      preferredName: string;
      
      // Contact
      email: string;
      phone: string;
      phoneType?: string; // e.g., "Mobile"
      
      // Location
      location: {
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      
      // URLs
      urls: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
      };
      
      // Resume PDF (stored as base64 or file reference)
      resumePdf?: {
        fileName: string;
        fileData: string; // base64 encoded
        uploadedAt: number; // timestamp
      };
    };
  
    // --- Education ---
    // LLM uses this to answer "Are you a student?" or "Graduation Date"
    education: Array<{
      id: string; // UUID for React rendering keys
      schoolName: string;
      degree: string;     // e.g., "Master of Science"
      major: string;      // e.g., "Computer Science"
      gpa?: string;
      startDate: string;  // Format: "MM/YYYY"
      endDate: string;    // Format: "MM/YYYY" or "Present"
    }>;
  
    // --- Experience ---
    // LLM uses this to answer "Years of experience" or specific skill questions
    experience: Array<{
      id: string;
      companyName: string;
      positionTitle: string;
      location?: string;
      startDate: string;
      endDate: string;
      isCurrent: boolean;
      description: string; // Raw bullet points for context injection
    }>;
  
    // --- Legal & Identity (Critical for Accuracy) ---
    // This section allows the LLM to handle complex logic questions 
    // (e.g., "Authorized to work without sponsorship?") better than regex.
    legal: {
      citizenshipStatus: 'U.S. Citizen' | 'Permanent Resident' | 'Foreign National';
      
      // Fine-grained visa status for complex reasoning
      visaStatus: {
        type: 'F-1' | 'H-1B' | 'O-1' | 'TN' | 'Other';
        // Context for "Will you now or in the future require sponsorship?"
        sponsorship: {
          requireNow: boolean;    // Usually FALSE for F-1 (CPT/OPT)
          requireFuture: boolean; // Usually TRUE for F-1 (H1B)
        };
        // Context for "Are you authorized to work?"
        workAuthorization: {
          authorized: boolean;    // TRUE for F-1 with CPT/OPT
          type: 'CPT' | 'OPT' | 'STEM OPT' | 'H-1B';
        };
      };
  
      // For EEOC (Equal Employment Opportunity) compliance questions
      demographics: {
        gender: 'Male' | 'Female' | 'Decline to identify' | string;
        race: 'Asian' | 'White' | 'Hispanic' | 'Black' | 'Decline to identify' | string;
        veteran: 'I am not a protected veteran' | 'Identify as veteran' | 'Decline to identify';
        disability: 'No, I do not have a disability' | 'Yes' | 'Decline to identify';
      };
    };
  
    // --- Preferences ---
    // Used for "Desired Salary" and "Relocation" questions
    preferences: {
      salary: {
        expected: number; // e.g., 120000
        currency: string; // e.g., "USD"
      };
      location: {
        remote: boolean;
        onsite: boolean;
        relocation: boolean;
      };
      startDate: string; // e.g., "Immediate" or "06/2026"
    };
  }
  
  // ==========================================
  // 2. Story Bank (For Generation / Mark 4)
  // ==========================================
  // The LLM retrieves data from here to generate open-ended responses
  // (e.g., "Tell me about a time you faced a challenge")
  export interface StoryBank {
    skills: string[]; // e.g., ["Python", "React", "K8s"]
    
    bio: {
      short: string;  // ~50 words
      long: string;   // ~200 words
    };
  
    // STAR method stories (Situation, Task, Action, Result)
    stories: Array<{
      id: string;
      tags: string[]; // e.g., ["Leadership", "Bug Fix", "System Design"]
      title: string;
      content: string; // The raw text content
    }>;
  }
  
  // ==========================================
  // 3. App Settings & State
  // ==========================================
  export interface AppSettings {
    openAiKey?: string;
    model: 'gpt-4o-mini' | 'gpt-4-turbo'; // mini is preferred for speed/cost
    language: 'en' | 'zh'; // UI Language
    autoSubmit: boolean;   // Safety feature (Default: False)
  }