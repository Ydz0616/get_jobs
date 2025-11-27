import React, { useEffect, useState, useRef, useCallback } from "react"
import type { PlasmoCSConfig } from "plasmo"
import { scanPageInputs, type ScannedField } from "./lib/scanner" // 确保路径正确

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_idle"
}

console.log("🚀 UCSD Agent: Injected & Ready")

// 🎨 为不同类型定义不同的颜色，方便调试
const getTypeColor = (type: string) => {
  if (type.includes('select') || type === 'combobox') return '#2563eb' // 蓝色 (下拉)
  if (type === 'date') return '#9333ea' // 紫色 (日期)
  if (type === 'checkbox' || type === 'radio') return '#16a34a' // 绿色 (勾选)
  if (type.includes('button')) return '#f59e0b' // 橙色 (按钮)
  return '#ef4444' // 红色 (默认文本框)
}

const ContentOverlay = () => {
  const [fields, setFields] = useState<ScannedField[]>([])
  const [tick, setTick] = useState(0) 
  const scanning = useRef(false)

  const triggerScan = useCallback(() => {
    if (scanning.current) return
    scanning.current = true
    
    requestAnimationFrame(() => {
      const detected = scanPageInputs()
      // 只有数量变化时才打印，减少 Console 噪音
      if (detected.length !== fields.length) {
        console.log(`👁️ Scan Update: Found ${detected.length} fields`)
      }
      // 始终更新 fields 以保证引用最新，防止位置计算失效
      setFields(detected)
      scanning.current = false
    })
  }, [fields.length])

  // 1. 轮询机制 (保持不变)
  useEffect(() => {
    triggerScan()
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      if (attempts > 10) clearInterval(interval)
      triggerScan()
    }, 1000)
    return () => clearInterval(interval)
  }, [triggerScan])

  // 2. 监听 DOM (保持不变)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false
      for (const m of mutations) if (m.addedNodes.length > 0) shouldScan = true
      if (shouldScan) triggerScan()
    })
    if (document.body) observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [triggerScan])

  // 3. 监听滚动 (保持不变)
  useEffect(() => {
    const handleResize = () => setTick(t => t + 1)
    window.addEventListener("scroll", handleResize, true) 
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("scroll", handleResize, true)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  if (fields.length === 0) return null

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2147483647 }}>
      {fields.map((field) => {
        const rect = field.element.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return null 

        // 获取对应的颜色
        const color = getTypeColor(field.type);

        return (
          <div
            key={field.id}
            style={{
              position: "absolute",
              left: rect.left + window.scrollX,
              top: rect.top + window.scrollY,
              width: rect.width,
              height: rect.height,
              border: `2px solid ${color}`, // 动态颜色边框
              backgroundColor: `${color}10`, // 10% 透明度背景
              borderRadius: "4px",
              pointerEvents: "none",
              transition: "all 0.1s"
            }}
          >
            <div style={{
              position: "absolute",
              top: -20, // 标签稍微上移一点，避免遮挡
              left: 0,
              backgroundColor: color,
              color: "white",
              padding: "2px 6px",
              fontSize: "10px",
              fontWeight: "bold",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              display: "flex",
              gap: "4px"
            }}>
              {/* 显示 类型 + Label，例如: [Select] Country */}
              <span style={{ opacity: 0.8 }}>[{field.type}]</span>
              <span>{field.label || "Unknown"}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ContentOverlay