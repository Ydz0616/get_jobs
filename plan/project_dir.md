src/
├── assets/                  # 图标、静态资源
├── background/              # [大脑] 后台服务 (长期运行)
│   ├── index.ts             # 入口：负责 API 调用、状态管理、消息分发
│   └── messages/            # 定义不同模块的消息处理逻辑 (Autofill, GenAI)
├── content/                 # [手眼] 注入脚本 (运行在网页中)
│   ├── index.ts             # 入口：负责监听 DOM 变化
│   ├── scanner/             # [眼] 识别网页元素 (Input, Select)
│   └── injector/            # [手] 模拟用户输入 (React Event Hacks)
├── popup/                   # [控制台] 点击插件图标弹出的简易窗口
├── sidepanel/               # [主界面] 侧边栏 (Mark 2/3 的核心，放队列和聊天)
├── options/                 # [设置页] 全屏页面，用于简历录入和配置
│
├── core/                    # === 核心业务逻辑 (跨模块复用) ===
│   ├── types.ts             # 上次定义的 Master Interface
│   ├── db/                  # IndexedDB (Dexie) 封装
│   ├── llm/                 # OpenAI API 封装 (Prompt 模板在这里)
│   └── state/               # Zustand 状态管理 (User Profile, Queue)
│
├── features/                # === 功能模块 (随 Iteration 增加) ===
│   ├── autofill/            # [Mark 1] 填表逻辑
│   │   ├── strategies/      # 策略模式：针对不同平台的特化逻辑
│   │   │   ├── base.ts      # 通用启发式逻辑 (Heuristic)
│   │   │   ├── workday.ts   # Workday 专用适配
│   │   │   ├── lever.ts     # Lever 专用适配
│   │   │   └── greenhouse.ts
│   │   └── matcher.ts       # 负责把 DOM Label 映射到 Profile 字段
│   │
│   ├── writer/              # [Mark 4] 文书生成 (暂时留空)
│   │   └── prompts.ts       # Cover Letter 专用 Prompt
│   │
│   └── tracker/             # [Mark 3] 申请追踪与队列 (暂时留空)
│
└── lib/                     # 工具函数 (Utils, Hooks, UI Components)
    ├── components/          # Shadcn UI 组件
    └── utils/               # 纯函数工具