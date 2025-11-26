import React, { useEffect, useState } from "react"
import { storageService } from "../core/storage"
import type { UserProfile } from "../core/types"

import "../style.css" // 

const OptionsIndex = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [status, setStatus] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"form" | "json">("form")

  // 1. Load data on mount (测试读取功能)
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

  // 2. Save handler (测试写入功能)
  const handleSave = async () => {
    if (!profile) return
    setStatus("⏳ Saving...")
    try {
      await storageService.saveProfile(profile)
      // 模拟延迟，让用户看到 loading 状态
      setTimeout(() => setStatus("✅ Saved successfully!"), 500)
    } catch (e) {
      setStatus("❌ Save failed")
    }
  }

  const handleBasicChange = (field: keyof UserProfile["basics"], value: string) => {
    if (!profile) return
    setProfile({
      ...profile,
      basics: {
        ...profile.basics,
        [field]: value
      }
    })
  }

  // render json editor 
  const renderJsonEditor = () => {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">
          Copy and paste json data; for fast import of resume
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

  // 渲染基础表单模式
  const renderBasicForm = () => {
    if (!profile) return null
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">First Name</label>
          <input
            className="w-full p-2 border rounded"
            value={profile.basics.firstName}
            onChange={(e) => handleBasicChange("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Last Name</label>
          <input
            className="w-full p-2 border rounded"
            value={profile.basics.lastName}
            onChange={(e) => handleBasicChange("lastName", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full p-2 border rounded"
            value={profile.basics.email}
            onChange={(e) => handleBasicChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Phone</label>
          <input
            className="w-full p-2 border rounded"
            value={profile.basics.phone}
            onChange={(e) => handleBasicChange("phone", e.target.value)}
          />
        </div>
      </div>
    )
  }

  if (!profile) return <div className="p-8">Loading profile...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <header className="mb-6 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">UCSD Job Copilot</h1>
            <p className="text-gray-500 text-sm">Profile Management & Data Center</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("form")}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === "form" ? "bg-blue-100 text-blue-700" : "text-gray-600"
              }`}>
              Basic Form
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

        {activeTab === "form" ? renderBasicForm() : renderJsonEditor()}

        <footer className="mt-8 pt-4 border-t flex justify-between items-center">
          <span className={`text-sm font-medium ${status.includes("❌") ? "text-red-500" : "text-green-600"}`}>
            {status}
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
