import React, { useEffect, useState, useRef, useCallback } from "react"
import type { PlasmoCSConfig } from "plasmo"
import { scanPageInputs, type ScannedField } from "./lib/scanner"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_idle"
}

console.log("🚀 UCSD Agent: Injected & Ready")

const ContentOverlay = () => {
  const [fields, setFields] = useState<ScannedField[]>([])
  const [tick, setTick] = useState(0) // 用于强制重绘
  const scanning = useRef(false)

  const triggerScan = useCallback(() => {
    if (scanning.current) return
    scanning.current = true
    
    // 使用 requestAnimationFrame 避免卡顿
    requestAnimationFrame(() => {
      const detected = scanPageInputs()
      // 只有数量变化时才更新 state，减少重渲染
      if (detected.length !== fields.length || detected.length > 0) {
        console.log(`👁️ Scan Update: Found ${detected.length} fields`)
        setFields(detected)
      }
      scanning.current = false
    })
  }, [fields.length])

  // 1. 轮询机制：前 10 秒每秒扫一次 (解决 React 慢加载问题)
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

  // 2. 监听 DOM 变化 (解决动态添加元素)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false
      for (const m of mutations) if (m.addedNodes.length > 0) shouldScan = true
      if (shouldScan) triggerScan()
    })
    if (document.body) observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [triggerScan])

  // 3. 监听滚动和窗口大小变化 (解决红框错位)
  useEffect(() => {
    const handleResize = () => setTick(t => t + 1)
    window.addEventListener("scroll", handleResize, true) // capture=true 捕获内部滚动
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
        // 实时计算位置
        const rect = field.element.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return null // 元素不可见了就不画

        return (
          <div
            key={field.id}
            style={{
              position: "absolute",
              left: rect.left + window.scrollX,
              top: rect.top + window.scrollY,
              width: rect.width,
              height: rect.height,
              border: "2px solid #ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderRadius: "4px",
              pointerEvents: "none",
              transition: "all 0.1s" // 平滑过渡
            }}
          >
            <div style={{
              position: "absolute",
              top: -20,
              left: 0,
              background: "#ef4444",
              color: "white",
              padding: "2px 6px",
              fontSize: "12px",
              fontWeight: "bold",
              borderRadius: "4px",
              whiteSpace: "nowrap"
            }}>
              {field.label || "Input"}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ContentOverlay