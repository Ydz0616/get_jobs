import React, { useEffect, useState } from "react"
import { storageService } from "../core/storage"
import type { UserProfile } from "../core/types"

import "../ui/style.css"

const OptionsIndex = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [status, setStatus] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"form" | "json">("form")
  const [activeSection, setActiveSection] = useState<string>("basics")

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await storageService.getProfile()
        setProfile(data)
      } catch (e) {
        console.error(e)
        setStatus("❌ Failed to load profile")
      }
    }
    loadData()
  }, [])

  // Save handler
  const handleSave = async () => {
    if (!profile) return
    setStatus("⏳ Saving...")
    try {
      // Auto-generate fullName if not set
      if (!profile.basics.fullName && profile.basics.firstName && profile.basics.lastName) {
        profile.basics.fullName = `${profile.basics.firstName} ${profile.basics.lastName}`
      }
      
      await storageService.saveProfile(profile)
      setTimeout(() => setStatus("✅ Saved successfully!"), 500)
    } catch (e) {
      setStatus("❌ Save failed")
    }
  }

  // Handle resume PDF upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== "application/pdf") {
      setStatus("⚠️ Please upload a PDF file")
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setStatus("⚠️ File size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      if (profile) {
        setProfile({
          ...profile,
          basics: {
            ...profile.basics,
            resumePdf: {
              fileName: file.name,
              fileData: base64.split(",")[1], // Remove data:application/pdf;base64, prefix
              uploadedAt: Date.now()
            }
          }
        })
        setStatus("✅ Resume uploaded successfully")
      }
    }
    reader.readAsDataURL(file)
  }

  // Generate UUID for new items
  const generateId = () => Math.random().toString(36).substring(2, 11)

  // Add new education entry
  const addEducation = () => {
    if (!profile) return
    setProfile({
      ...profile,
      education: [
        ...profile.education,
        {
          id: generateId(),
          schoolName: "",
          degree: "",
          major: "",
          startDate: "",
          endDate: "Present"
        }
      ]
    })
  }

  // Remove education entry
  const removeEducation = (id: string) => {
    if (!profile) return
    setProfile({
      ...profile,
      education: profile.education.filter(e => e.id !== id)
    })
  }

  // Update education entry
  const updateEducation = (id: string, field: string, value: string) => {
    if (!profile) return
    setProfile({
      ...profile,
      education: profile.education.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    })
  }

  // Add new experience entry
  const addExperience = () => {
    if (!profile) return
    setProfile({
      ...profile,
      experience: [
        ...profile.experience,
        {
          id: generateId(),
          companyName: "",
          positionTitle: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          description: ""
        }
      ]
    })
  }

  // Remove experience entry
  const removeExperience = (id: string) => {
    if (!profile) return
    setProfile({
      ...profile,
      experience: profile.experience.filter(e => e.id !== id)
    })
  }

  // Update experience entry
  const updateExperience = (id: string, field: string, value: string | boolean) => {
    if (!profile) return
    setProfile({
      ...profile,
      experience: profile.experience.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    })
  }

  // Render JSON editor
  const renderJsonEditor = () => {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">
          Copy and paste JSON data for fast import of resume
        </p>
        <textarea
          className="w-full h-96 p-4 font-mono text-xs border rounded bg-slate-50"
          value={JSON.stringify(profile, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              setProfile(parsed)
              setStatus("")
            } catch (err) {
              setStatus("⚠️ Invalid JSON")
            }
          }}
        />
      </div>
    )
  }

  // Render section navigation
  const renderSectionNav = () => {
    const sections = [
      { id: "basics", label: "Basic Info" },
      { id: "location", label: "Location" },
      { id: "urls", label: "URLs" },
      { id: "resume", label: "Resume" },
      { id: "education", label: "Education" },
      { id: "experience", label: "Experience" },
      { id: "legal", label: "Legal & Visa" },
      { id: "preferences", label: "Preferences" }
    ]

    return (
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeSection === section.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    )
  }

  // Render basic info section
  const renderBasics = () => {
    if (!profile) return null
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
        
        {/* Nationality/Citizenship */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Nationality / Citizenship Status *</label>
          <select
            className="w-full p-2 border rounded"
            value={profile.legal.citizenshipStatus}
            onChange={(e) => setProfile({
              ...profile,
              legal: {
                ...profile.legal,
                citizenshipStatus: e.target.value as any
              }
            })}
          >
            <option value="U.S. Citizen">U.S. Citizen</option>
            <option value="Permanent Resident">Permanent Resident</option>
            <option value="Foreign National">Foreign National</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name (English) */}
          <div className="space-y-1">
            <label className="text-sm font-medium">First Name (English) *</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.firstName}
              onChange={(e) => setProfile({
                ...profile,
                basics: { ...profile.basics, firstName: e.target.value }
              })}
              placeholder="John"
            />
          </div>

          {/* Last Name (English) */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Last Name (English) *</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.lastName}
              onChange={(e) => setProfile({
                ...profile,
                basics: { ...profile.basics, lastName: e.target.value }
              })}
              placeholder="Doe"
            />
          </div>

          {/* First Name (Native) */}
          <div className="space-y-1">
            <label className="text-sm font-medium">First Name (Native Alphabet)</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.firstNameNative || ""}
              onChange={(e) => setProfile({
                ...profile,
                basics: { ...profile.basics, firstNameNative: e.target.value }
              })}
              placeholder="名"
            />
          </div>

          {/* Last Name (Native) */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Last Name (Native Alphabet)</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.lastNameNative || ""}
              onChange={(e) => setProfile({
                ...profile,
                basics: { ...profile.basics, lastNameNative: e.target.value }
              })}
              placeholder="姓"
            />
          </div>

          {/* Preferred Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Preferred Name</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.preferredName}
              onChange={(e) => setProfile({
                ...profile,
                basics: { ...profile.basics, preferredName: e.target.value }
              })}
              placeholder="Johnny"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={profile.basics.email}
              onChange={(e) => setProfile({
                ...profile,
                basics: { ...profile.basics, email: e.target.value }
              })}
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Phone Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone Type</label>
            <select
              className="w-full p-2 border rounded"
              value={profile.basics.phoneType || "Mobile"}
              onChange={(e) => setProfile({
                ...profile,
                basics: { ...profile.basics, phoneType: e.target.value }
              })}
            >
              <option value="Mobile">Mobile</option>
              <option value="Home">Home</option>
              <option value="Work">Work</option>
            </select>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone Number (United States) *</label>
            <input
              type="tel"
              className="w-full p-2 border rounded"
              value={profile.basics.phone}
              onChange={(e) => setProfile({
                ...profile,
                basics: { ...profile.basics, phone: e.target.value }
              })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>
    )
  }

  // Render location section
  const renderLocation = () => {
    if (!profile) return null
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium">Address</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.location.address}
              onChange={(e) => setProfile({
                ...profile,
                basics: {
                  ...profile.basics,
                  location: { ...profile.basics.location, address: e.target.value }
                }
              })}
              placeholder="123 Main St"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">City</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.location.city}
              onChange={(e) => setProfile({
                ...profile,
                basics: {
                  ...profile.basics,
                  location: { ...profile.basics.location, city: e.target.value }
                }
              })}
              placeholder="San Diego"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">State</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.location.state}
              onChange={(e) => setProfile({
                ...profile,
                basics: {
                  ...profile.basics,
                  location: { ...profile.basics.location, state: e.target.value }
                }
              })}
              placeholder="CA"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">ZIP Code</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.location.zipCode}
              onChange={(e) => setProfile({
                ...profile,
                basics: {
                  ...profile.basics,
                  location: { ...profile.basics.location, zipCode: e.target.value }
                }
              })}
              placeholder="92122"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Country</label>
            <input
              className="w-full p-2 border rounded"
              value={profile.basics.location.country}
              onChange={(e) => setProfile({
                ...profile,
                basics: {
                  ...profile.basics,
                  location: { ...profile.basics.location, country: e.target.value }
                }
              })}
              placeholder="United States"
            />
          </div>
        </div>
      </div>
    )
  }

  // Render URLs section
  const renderUrls = () => {
    if (!profile) return null
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">URLs</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">LinkedIn</label>
            <input
              type="url"
              className="w-full p-2 border rounded"
              value={profile.basics.urls.linkedin || ""}
              onChange={(e) => setProfile({
                ...profile,
                basics: {
                  ...profile.basics,
                  urls: { ...profile.basics.urls, linkedin: e.target.value }
                }
              })}
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">GitHub</label>
            <input
              type="url"
              className="w-full p-2 border rounded"
              value={profile.basics.urls.github || ""}
              onChange={(e) => setProfile({
                ...profile,
                basics: {
                  ...profile.basics,
                  urls: { ...profile.basics.urls, github: e.target.value }
                }
              })}
              placeholder="https://github.com/yourname"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Personal Website / Portfolio</label>
            <input
              type="url"
              className="w-full p-2 border rounded"
              value={profile.basics.urls.portfolio || ""}
              onChange={(e) => setProfile({
                ...profile,
                basics: {
                  ...profile.basics,
                  urls: { ...profile.basics.urls, portfolio: e.target.value }
                }
              })}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>
    )
  }

  // Render resume section
  const renderResume = () => {
    if (!profile) return null
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resume PDF</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Upload Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
              className="w-full p-2 border rounded"
            />
            <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
          </div>
          {profile.basics.resumePdf && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✅ Resume uploaded: {profile.basics.resumePdf.fileName}
              </p>
              <p className="text-xs text-green-600">
                Uploaded: {new Date(profile.basics.resumePdf.uploadedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render education section
  const renderEducation = () => {
    if (!profile) return null
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Education</h3>
          <button
            onClick={addEducation}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Education
          </button>
        </div>
        {profile.education.map((edu, index) => (
          <div key={edu.id} className="p-4 border rounded space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">Education #{index + 1}</h4>
              <button
                onClick={() => removeEducation(edu.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">School Name *</label>
                <input
                  className="w-full p-2 border rounded"
                  value={edu.schoolName}
                  onChange={(e) => updateEducation(edu.id, "schoolName", e.target.value)}
                  placeholder="University of California, San Diego"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Degree *</label>
                <input
                  className="w-full p-2 border rounded"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                  placeholder="Master of Science"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Major *</label>
                <input
                  className="w-full p-2 border rounded"
                  value={edu.major}
                  onChange={(e) => updateEducation(edu.id, "major", e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">GPA (Optional)</label>
                <input
                  className="w-full p-2 border rounded"
                  value={edu.gpa || ""}
                  onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                  placeholder="3.8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Start Date (MM/YYYY) *</label>
                <input
                  className="w-full p-2 border rounded"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                  placeholder="09/2022"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">End Date (MM/YYYY or "Present") *</label>
                <input
                  className="w-full p-2 border rounded"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                  placeholder="Present"
                />
              </div>
            </div>
          </div>
        ))}
        {profile.education.length === 0 && (
          <p className="text-gray-500 text-sm">No education entries. Click "Add Education" to add one.</p>
        )}
      </div>
    )
  }

  // Render experience section
  const renderExperience = () => {
    if (!profile) return null
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
          <button
            onClick={addExperience}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Experience
          </button>
        </div>
        {profile.experience.map((exp, index) => (
          <div key={exp.id} className="p-4 border rounded space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">Experience #{index + 1}</h4>
              <button
                onClick={() => removeExperience(exp.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Company Name *</label>
                <input
                  className="w-full p-2 border rounded"
                  value={exp.companyName}
                  onChange={(e) => updateExperience(exp.id, "companyName", e.target.value)}
                  placeholder="Google"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Position Title *</label>
                <input
                  className="w-full p-2 border rounded"
                  value={exp.positionTitle}
                  onChange={(e) => updateExperience(exp.id, "positionTitle", e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Location (Optional)</label>
                <input
                  className="w-full p-2 border rounded"
                  value={exp.location || ""}
                  onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                  placeholder="San Diego, CA"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Start Date (MM/YYYY) *</label>
                <input
                  className="w-full p-2 border rounded"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                  placeholder="06/2023"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">End Date (MM/YYYY or "Present") *</label>
                <input
                  className="w-full p-2 border rounded"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                  placeholder="Present"
                />
              </div>
              <div className="space-y-1 flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exp.isCurrent}
                    onChange={(e) => updateExperience(exp.id, "isCurrent", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Current Position</span>
                </label>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={4}
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                  placeholder="• Developed features using React and TypeScript&#10;• Improved performance by 30%&#10;• Collaborated with cross-functional teams"
                />
                <p className="text-xs text-gray-500">Use bullet points to describe your responsibilities and achievements</p>
              </div>
            </div>
          </div>
        ))}
        {profile.experience.length === 0 && (
          <p className="text-gray-500 text-sm">No experience entries. Click "Add Experience" to add one.</p>
        )}
      </div>
    )
  }

  // Render legal section
  const renderLegal = () => {
    if (!profile) return null
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal & Visa Status</h3>
        
        {/* Visa Type */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Visa Type *</label>
          <select
            className="w-full p-2 border rounded"
            value={profile.legal.visaStatus.type}
            onChange={(e) => setProfile({
              ...profile,
              legal: {
                ...profile.legal,
                visaStatus: {
                  ...profile.legal.visaStatus,
                  type: e.target.value as any
                }
              }
            })}
          >
            <option value="F-1">F-1</option>
            <option value="H-1B">H-1B</option>
            <option value="O-1">O-1</option>
            <option value="TN">TN</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Work Authorization */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Work Authorization Type *</label>
          <select
            className="w-full p-2 border rounded"
            value={profile.legal.visaStatus.workAuthorization.type}
            onChange={(e) => setProfile({
              ...profile,
              legal: {
                ...profile.legal,
                visaStatus: {
                  ...profile.legal.visaStatus,
                  workAuthorization: {
                    ...profile.legal.visaStatus.workAuthorization,
                    type: e.target.value as any
                  }
                }
              }
            })}
          >
            <option value="CPT">CPT</option>
            <option value="OPT">OPT</option>
            <option value="STEM OPT">STEM OPT</option>
            <option value="H-1B">H-1B</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Work Authorization Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Authorized to Work? *</label>
            <select
              className="w-full p-2 border rounded"
              value={profile.legal.visaStatus.workAuthorization.authorized ? "Yes" : "No"}
              onChange={(e) => setProfile({
                ...profile,
                legal: {
                  ...profile.legal,
                  visaStatus: {
                    ...profile.legal.visaStatus,
                    workAuthorization: {
                      ...profile.legal.visaStatus.workAuthorization,
                      authorized: e.target.value === "Yes"
                    }
                  }
                }
              })}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Sponsorship Now */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Require Sponsorship Now? *</label>
            <select
              className="w-full p-2 border rounded"
              value={profile.legal.visaStatus.sponsorship.requireNow ? "Yes" : "No"}
              onChange={(e) => setProfile({
                ...profile,
                legal: {
                  ...profile.legal,
                  visaStatus: {
                    ...profile.legal.visaStatus,
                    sponsorship: {
                      ...profile.legal.visaStatus.sponsorship,
                      requireNow: e.target.value === "Yes"
                    }
                  }
                }
              })}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {/* Sponsorship Future */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Require Sponsorship in Future? *</label>
            <select
              className="w-full p-2 border rounded"
              value={profile.legal.visaStatus.sponsorship.requireFuture ? "Yes" : "No"}
              onChange={(e) => setProfile({
                ...profile,
                legal: {
                  ...profile.legal,
                  visaStatus: {
                    ...profile.legal.visaStatus,
                    sponsorship: {
                      ...profile.legal.visaStatus.sponsorship,
                      requireFuture: e.target.value === "Yes"
                    }
                  }
                }
              })}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        {/* Demographics */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-md font-semibold text-gray-700 mb-4">Demographics (EEOC Compliance)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Gender</label>
              <select
                className="w-full p-2 border rounded"
                value={profile.legal.demographics.gender}
                onChange={(e) => setProfile({
                  ...profile,
                  legal: {
                    ...profile.legal,
                    demographics: {
                      ...profile.legal.demographics,
                      gender: e.target.value
                    }
                  }
                })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Decline to identify">Decline to identify</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Race / Ethnicity</label>
              <select
                className="w-full p-2 border rounded"
                value={profile.legal.demographics.race}
                onChange={(e) => setProfile({
                  ...profile,
                  legal: {
                    ...profile.legal,
                    demographics: {
                      ...profile.legal.demographics,
                      race: e.target.value
                    }
                  }
                })}
              >
                <option value="Asian">Asian</option>
                <option value="White">White</option>
                <option value="Hispanic">Hispanic</option>
                <option value="Black">Black</option>
                <option value="Decline to identify">Decline to identify</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Veteran Status</label>
              <select
                className="w-full p-2 border rounded"
                value={profile.legal.demographics.veteran}
                onChange={(e) => setProfile({
                  ...profile,
                  legal: {
                    ...profile.legal,
                    demographics: {
                      ...profile.legal.demographics,
                      veteran: e.target.value as any
                    }
                  }
                })}
              >
                <option value="I am not a protected veteran">I am not a protected veteran</option>
                <option value="Identify as veteran">Identify as veteran</option>
                <option value="Decline to identify">Decline to identify</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Disability Status</label>
              <select
                className="w-full p-2 border rounded"
                value={profile.legal.demographics.disability}
                onChange={(e) => setProfile({
                  ...profile,
                  legal: {
                    ...profile.legal,
                    demographics: {
                      ...profile.legal.demographics,
                      disability: e.target.value as any
                    }
                  }
                })}
              >
                <option value="No, I do not have a disability">No, I do not have a disability</option>
                <option value="Yes">Yes</option>
                <option value="Decline to identify">Decline to identify</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render preferences section
  const renderPreferences = () => {
    if (!profile) return null
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Preferences</h3>
        
        {/* Salary */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Expected Salary (USD)</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={profile.preferences.salary.expected || ""}
              onChange={(e) => setProfile({
                ...profile,
                preferences: {
                  ...profile.preferences,
                  salary: {
                    ...profile.preferences.salary,
                    expected: parseInt(e.target.value) || 0
                  }
                }
              })}
              placeholder="120000"
            />
            <select
              className="w-32 p-2 border rounded"
              value={profile.preferences.salary.currency}
              onChange={(e) => setProfile({
                ...profile,
                preferences: {
                  ...profile.preferences,
                  salary: {
                    ...profile.preferences.salary,
                    currency: e.target.value
                  }
                }
              })}
            >
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Work Location Preferences */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Work Location Preferences</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.preferences.location.remote}
                onChange={(e) => setProfile({
                  ...profile,
                  preferences: {
                    ...profile.preferences,
                    location: {
                      ...profile.preferences.location,
                      remote: e.target.checked
                    }
                  }
                })}
                className="w-4 h-4"
              />
              <span className="text-sm">Remote Work</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.preferences.location.onsite}
                onChange={(e) => setProfile({
                  ...profile,
                  preferences: {
                    ...profile.preferences,
                    location: {
                      ...profile.preferences.location,
                      onsite: e.target.checked
                    }
                  }
                })}
                className="w-4 h-4"
              />
              <span className="text-sm">On-site Work</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.preferences.location.relocation}
                onChange={(e) => setProfile({
                  ...profile,
                  preferences: {
                    ...profile.preferences,
                    location: {
                      ...profile.preferences.location,
                      relocation: e.target.checked
                    }
                  }
                })}
                className="w-4 h-4"
              />
              <span className="text-sm">Willing to Relocate</span>
            </label>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Available Start Date</label>
          <input
            className="w-full p-2 border rounded"
            value={profile.preferences.startDate}
            onChange={(e) => setProfile({
              ...profile,
              preferences: {
                ...profile.preferences,
                startDate: e.target.value
              }
            })}
            placeholder="Immediate or 06/2026"
          />
        </div>
      </div>
    )
  }

  // Render active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case "basics": return renderBasics()
      case "location": return renderLocation()
      case "urls": return renderUrls()
      case "resume": return renderResume()
      case "education": return renderEducation()
      case "experience": return renderExperience()
      case "legal": return renderLegal()
      case "preferences": return renderPreferences()
      default: return renderBasics()
    }
  }

  if (!profile) return <div className="p-8">Loading profile...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <header className="mb-6 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">UCSD Job Copilot</h1>
            <p className="text-gray-500 text-sm">Complete Profile Management</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("form")}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === "form" ? "bg-blue-100 text-blue-700" : "text-gray-600"
              }`}>
              Form
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === "json" ? "bg-purple-100 text-purple-700" : "text-gray-600"
              }`}>
              JSON Editor
            </button>
          </div>
        </header>

        {activeTab === "form" ? (
          <>
            {renderSectionNav()}
            <div className="mt-4">
              {renderActiveSection()}
            </div>
          </>
        ) : (
          renderJsonEditor()
        )}

        <footer className="mt-8 pt-4 border-t flex justify-between items-center">
          <span className={`text-sm font-medium ${status.includes("❌") ? "text-red-500" : status.includes("⚠️") ? "text-yellow-600" : "text-green-600"}`}>
            {status || "Ready to save"}
          </span>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  )
}

export default OptionsIndex
