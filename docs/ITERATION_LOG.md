# 迭代日志

## V1.0.2 - 2026-05-29

### 规则准确性与版本追踪修正

**关键词匹配优先级**
- `classifyFood` 重构为「最长关键词优先」匹配策略
- "三文鱼"(3字) 优先于 "鱼"(1字)，"番茄酱"(3字) 优先于 "番茄"(2字)
- 同长度关键词取规则库中先出现的那条（稳定、可解释）

**小票导入人工修改保护**
- `ReceiptItem` 新增 `manualOverrides` 字段标记手动修改的分类/存放位置/到期日
- `handleNameBlur` 重新分类时仅更新未被手动修改的字段
- 新增"恢复自动建议"按钮，清除所有手动覆盖标记
- `handleConfirmImport` 保留用户确认的 `expirySource`，不再硬编码 "auto"

**分类默认保质期**
- 新增 `CATEGORY_DEFAULT_SHELF_LIFE`（12 个分类各自的默认保质天数）
- `calculateShelfLife` 在无具体规则匹配时使用分类默认值，不再套用同分类中第一条具体食品规则
- 未识别水果不再自动套用苹果的 21 天，而是使用水果分类默认的 7 天

**GitHub Actions CI**
- 新增 `.github/workflows/ci.yml`
- push/PR 触发: `npm ci` → `lint` → `typecheck` → `test` → `build`
- Node.js 22 LTS

**版本记录**
- `package.json` 版本号: `0.1.0` → `1.0.2`
- 新增 `CHANGELOG.md`（含 V1.0.0 / V1.0.1 / V1.0.2）
- 本迭代日志同步记录

### 测试

- 测试文件: 4 个，用例: 59 条（原 42 + 新增 17）
  - 关键词优先级: +4
  - 手动修改保护: +7
  - 分类兜底: +4
  - 保质期优先级: +2

### 剩余限制

- 小票识别仍为模拟数据
- 无用户/家庭共享/云同步/推送通知
- 未实现离线数据导出

---

## V1.0.1 - 2026-05-29

### 稳定化修正

**工程脚本**
- ESLint 迁移为 flat config (`eslint.config.mjs`)，适配 Next.js 16
- lint 脚本改为 `eslint src/`（兼容中文目录路径）
- viewport / themeColor 迁移至 `export const viewport`，消除 build 警告
- 全部四项脚本 (lint / typecheck / build / test) 零错误通过

**保质期规则匹配修正**
- 修复「同分类不同食品共用错误保质天数」的根本原因
- `classifyFood` 返回 `matchedRuleKeyword`，`calculateShelfLife` 支持按关键词查找特定规则
- 草莓 3 天 vs 苹果 21 天 等场景现在各自独立计算
- 新增 14 项 per-food 保质期集成测试

**小票导入增强**
- RecognizedItemsList 支持编辑分类、存放位置、到期日期
- 名称失焦后自动重新分类并更新建议值

**数据模型补强 (Dexie v2)**
- 新增字段: `referenceShelfLifeDays`、`matchedRuleKeyword`、`source`、`receiptId`
- `createFoodItem` / `createFoodItems` 自动填充元数据
- DATA_MODEL.md 已同步更新

**代码质量**
- 消除 `set-state-in-effect` ESLint error (DisclaimerBar lazy init)
- 移除未使用的 import (ExpiryOverview, migrations.ts)
- not-found 页面 `<a>` → `<Link>`

### 测试

- 测试文件: 3 个，用例: 42 条 (原 28 + 新增 14)

---

## V1.0 - 2026-05-28

### 完成内容

- 项目初始化：Next.js 16 + TypeScript + Tailwind CSS v4
- 数据模型定义：FoodItem、ReceiptImport、ShelfLifeRule
- 本地规则库：覆盖常见食品的分类和保质期规则
- 分类引擎：基于关键词的食品自动分类
- 保质期计算器：根据分类、存放位置和开封状态计算参考期限
- 数据访问层：Dexie.js IndexedDB 封装
- 手动添加食品：表单录入 + 自动建议
- 库存首页：临期概览 + 存储区域卡片
- 库存列表：筛选、排序、搜索
- 食品详情：编辑、标记吃完/丢弃、删除
- 小票模拟导入：图片上传 + 模拟识别 + 批量导入
- 历史记录：已处理食品列表
- 底部导航栏
- 保质期免责声明
- 单元测试
- PWA 基础配置

### 存在的问题

- 小票识别为模拟数据，需接入真实 OCR API
- 无用户系统，数据仅保存在单个浏览器
- 无消息提醒功能
- 无离线数据导出功能

### 下一轮迭代方向

详见 [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md)
