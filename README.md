# 学术诚信撤稿监测仪表盘

> Retraction Watch Professional Intelligence Dashboard

[![GitHub Stars](https://img.shields.io/github/stars/leechanges/retraction-watch-viz?style=social)](https://github.com/leechanges/retraction-watch-viz)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

一个基于 **Retraction Watch** 开放数据库构建的学术撤稿可视化监测平台。帮助研究人员、期刊编辑、学术机构实时追踪全球科研撤稿趋势，发现学术诚信风险。

---

## 功能特性

### 数据可视化
- **时间趋势图** - 历年撤稿数量走势，支持缩放和详情悬停
- **国家分布图** - 全球 Top 8 撤稿国家排名，一键穿透到国家详情页
- **学科雷达图** - 各学科领域撤稿分布对比
- **撤稿原因分析** - 主要撤稿原因占比与排序
- **高频来源排行** - 重灾期刊、重灾机构 Top 5

### 数据探索
- **多维筛选** - 按年份、撤稿性质、国家、学科快速过滤
- **全文搜索** - 支持搜索论文标题、作者、DOI、期刊名、机构
- **智能排序** - 按任意列升序/降序排列
- **分页浏览** - 支持跳转到任意页面

### 数据导出
- **CSV 导出** - 一键导出筛选后的完整数据
- **JSON 导出** - 方便二次分析与集成

### 协作与分享
- **链接分享** - 筛选状态编码在 URL 中，一键复制分享给同事
- **国家详情页** - 点击任意国家进入该国撤稿详情

### 无障碍与性能
- 完整 ARIA 标签支持、键盘导航、skip link
- 骨架屏加载、代码分割、懒加载
- 响应式布局，适配桌面与移动端

---

## 截图预览

```
┌─────────────────────────────────────────────────────────────┐
│  学术诚信撤稿监测 PRO                              [搜索]    │
├─────────────────────────────────────────────────────────────┤
│  [总撤稿数: 52,234]  [正式撤稿: 48,120]  [国家: 142]  [期刊] │
├─────────────────────────────────────────────────────────────┤
│  [时间趋势图]                              [学科雷达图]       │
│  ~~~ area chart ~~~                      ~~~ radar ~~~      │
├─────────────────────────────────────────────────────────────┤
│  [国家 TOP8]   [撤稿原因分析]   [高频来源]                    │
│  ~~~ bar ~~~   ~~~ bar ~~~     ~~~ list ~~~                │
├─────────────────────────────────────────────────────────────┤
│  明细记录 (52,234 条)                            [CSV][JSON] │
│  标题 | DOI | 期刊 | 国家 | 日期 | 撤稿原因                  │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 样式 | Tailwind CSS |
| 图表 | Recharts |
| 路由 | React Router v6 |
| 图标 | Lucide React |
| 数据 | Retraction Watch (Crossref 开放数据) |

---

## 快速开始

### 前置依赖

- Node.js >= 18
- Bun 或 npm

### 安装

```bash
# 克隆仓库
git clone https://github.com/leechanges/retraction-watch-viz.git
cd retraction-watch-viz

# 安装依赖
bun install
# 或
npm install

# 启动开发服务器
bun dev
# 或
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
bun build
# 或
npm run build
```

---

## 数据说明

数据来源为 [Retraction Watch](https://retractionwatch.com/) 的 [Crossref 开放数据](https://retractionwatch.com/retractionwatch-public-data-license/)。

原始数据文件位于 `public/retraction_watch.csv`，预聚合数据位于 `public/chart-data.json`。

> 仅供研究与教育目的。数据版权归属 Retraction Watch。

---

## 项目结构

```
src/
├── components/
│   ├── charts/          # 图表组件
│   │   ├── TrendChart.tsx       # 面积趋势图
│   │   ├── CountryChart.tsx     # 横向条形图
│   │   ├── SubjectRadarChart.tsx # 雷达图
│   │   ├── ReasonBarChart.tsx   # 撤稿原因
│   │   └── JournalChart.tsx    # 来源排行
│   ├── Header.tsx        # 页头 + 搜索 + 分享
│   ├── FilterBar.tsx     # 多维筛选栏
│   ├── ExportBar.tsx     # 导出按钮组
│   ├── KpiCard.tsx       # KPI 指标卡
│   ├── RetractionTable.tsx  # 数据明细表
│   └── charts/ChartPanel.tsx  # 图表面板容器
├── lib/
│   ├── types.ts          # TypeScript 类型定义
│   ├── data.ts           # 数据获取与处理
│   ├── utils.ts          # 工具函数
│   └── export.ts         # CSV/JSON 导出
├── pages/
│   ├── GlobalDashboard.tsx   # 全局概览页
│   └── CountryPage.tsx       # 国家详情页
├── App.tsx               # 路由配置
├── main.tsx              # 入口文件
└── index.css             # 全局样式
```

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 `git checkout -b feature/my-feature`
3. 提交改动 `git commit -m 'Add some feature'`
4. 推送到分支 `git push origin feature/my-feature`
5. 开启 Pull Request

---

## License

MIT © leechanges
