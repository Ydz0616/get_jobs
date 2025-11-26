# **7-Week Development Roadmap**

| Timeline | Phase | Goal (目标) | 核心任务 (Tasks) | 交付标准 (Deliverable) |
| :---- | :---- | :---- | :---- | :---- |
| **Week 1** *(11.24 \- 11.30)* | **Data Foundation** 数据基建 | **建立完美的 Profile 数据结构** *(Autofill 准不准，全看数据细不细)* | 1\. **\[Sat\]** 初始化项目，定义 Master TS Interface。 2\. **\[Sun\]** 搭建 Profile 录入界面 (Form UI)。 3\. **\[Weekday\]** 实现简历 PDF 解析入库 (Parser)。 | ✅ 侧边栏能打开。 ✅ PDF 简历上传后，自动变成结构化的 JSON 存入本地数据库。 |
| **Week 2** *(12.01 \- 12.07)* | **Vision (The Eyes)** 网页感知 | **攻克 Simplify 搞不定的 DOM** *(解决漏选 Bug 的关键)* | 1\. **\[Sat\]** 开发 DomScanner。重点：识别 Shadow DOM 和 iframe。 2\. **\[Sun\]** 编写 Prompt，让 LLM 识别非标准 Checkbox/Radio。 3\. **\[Weekday\]** 找 5 个"奇葩"网页测试识别率。 | ✅ 打开网页，插件能精准画框： "这是Visa选项(Div)"，"这是姓名(Input)"。 ❌ 没有漏掉隐蔽的输入框。 |
| **Week 3** *(12.08 \- 12.14)* | **Action (The Hands)** 填表执行 | **实现 "Native-Level" 填充** *(解决填了提交为空的 Bug)* | 1\. **\[Sat\]** 开发 SyntheticEvent 模拟器 (解决 React 输入失效)。 2\. **\[Sun\]** 实现 LLM 决策逻辑：根据 Profile 选 Yes/No。 3\. **\[Weekday\]** 实测 Workday 和 Lever 流程。 | ✅ 点击 Auto-Fill，基本信息秒填。 ✅ 复杂的 Visa 问题选择正确。 ✅ 提交时不报错。 |
| **Week 4** *(12.15 \- 12.21)* | **Creation** 文书生成 | **杀手锏：Open Question Generator** | 1\. **\[Sat\]** 抓取页面 JD (Job Description)。 2\. **\[Sun\]** 调试 RAG Prompt：用简历素材回答 JD 问题。 3\. **\[Weekday\]** 优化生成速度和语气。 | 🚀 **MVP 里程碑** ✅ "Why Us" 自动填好。 ✅ Cover Letter 自动生成。 |
| **Week 5** *(12.22 \- 12.28)* | **Workflow** 任务队列 | **实现 "Batch Mode"** | 1\. **\[Sat\]** 引入 Zustand 管理任务状态。 2\. **\[Sun\]** 开发 Dashboard (待提交列表)。 3\. **\[Weekday\]** 优化后台保活逻辑。 | ✅ 可以连续打开 5 个网页，加入队列，统一处理。 |
| **Week 6** *(12.29 \- 01.04)* | **Compatibility** 兼容性地狱 | **专项适配 Top 平台** | 1\. **\[Sat\]** 死磕 Workday (最难)。 2\. **\[Sun\]** 适配 Greenhouse/iCIMS。 3\. **\[Weekday\]** 修复各种边缘 Bug。 | ✅ 在主流招聘网站上的成功率 \> 95%。 |
| **Week 7** *(01.05 \- 01.11)* | **Launch** 发布 | **包装与上架** | 1\. **\[Sat\]** UI 美化，Loading 动画。 2\. **\[Sun\]** 录制 Demo，写文案。 3\. **\[Weekday\]** 提交 Chrome Store 审核。 | 🚀 **产品上线** 🎉 发给第一批 UCSD 用户。 |

