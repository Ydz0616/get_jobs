# **Project: UCSD F-1 Job Agent (Anti-Simplify)**

Version: Final Strategy  
Date: 2025-11-22  
Repo: get\_jobs

## **1\. 核心定位 (Core Identity)**

我们不是另一个 "Auto-filler Script"，我们是 **"Intelligent Job Copilot"**。

* **对于简单题：** 我们是**更准确**的填表器（解决漏选、选错的问题）。  
* **对于难题：** 我们是**全自动**的文书写作者（解决 Cover Letter/Open Questions）。  
* **对于流程：** 我们提供**批处理**能力（解决盯着屏幕发呆的痛点）。

## **2\. 为什么能战胜 Simplify? (The Edge)**

Simplify 的 bug 源于它看不懂网页，只能匹配代码。  
我们的优势在于：

1. **Semantic Autofill (语义填表):**  
   * 利用 LLM 理解网页 DOM 的真实含义，攻克 Shadow DOM、非标准 Checkbox 和陷阱式提问。  
   * **目标：** 做到 99% 的准确率，让用户从 "检查每一个空" 变成 "扫一眼就放心"。  
2. **Generative Filling (生成式填充):**  
   * Simplify 留白的地方（Open Questions），我们直接填好。这是质的体验飞跃。  
3. **Local & Secure (本地优先):**  
   * 所有简历数据和生成逻辑都在本地/浏览器端完成，保护隐私。

## **3\. 核心数据结构 (The Knowledge Graph)**

为了支持“语义填表”，我们的 Profile 必须比 PDF 简历更结构化：

* **Bio-Data:** 标准化字段 (Name, Phone, etc.)。  
* **Visa Logic:** 明确的 F1/OPT/H1B 规则配置。  
* **Resume Chunks:** 将简历拆解为 "Education", "Project A", "Project B" 等独立块，方便 LLM 抓取重组。

## **4\. 技术栈决策**

* **Frontend:** Plasmo (Chrome Extension framework)  
* **Storage:** IndexedDB (Dexie.js) \- *为了存大量 Log 和多个版本的 Resume*  
* **Brain:** OpenAI API (GPT-4o-mini) \- *成本低，速度快，逻辑足够处理填表*  
* **DOM Strategy:** Heuristic Analysis \+ LLM Decision (混合模式)