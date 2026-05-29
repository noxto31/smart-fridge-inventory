# V1 质量审查报告

审查日期: 2026-05-29  
审查范围: V1.0 源码级稳定化修正

## 1. 工程脚本

| 命令 | 状态 | 备注 |
|------|------|------|
| `npm run lint` | ✅ 0 errors, 0 warnings | flat config + `eslint src/` |
| `npm run typecheck` | ✅ 无错误 | tsc --noEmit |
| `npm run build` | ✅ 无警告 | 7/7 页面生成 |
| `npm run test:run` | ✅ 42 passed | 3 文件 |

**变更清单:**
- 新增 `eslint.config.mjs` (ESLint 9 flat config)
- `package.json` lint 脚本: `next lint` → `eslint src/`
- `layout.tsx`: `viewport` + `themeColor` 迁移至 `export const viewport`
- `DisclaimerBar.tsx`: 消除 `set-state-in-effect`，改为 lazy initial state
- `ExpiryOverview.tsx`: 移除未使用的 `Badge` import
- `not-found.tsx`: `<a>` → `<Link>`
- `migrations.ts`: 移除未使用的 `db` import
- `ImageUploader.tsx`: 抑制 blob URL 的 `<img>` 警告

## 2. 保质期规则匹配

**问题:** `classifyFood("草莓")` 返回 `{category: "fruit", storageZone: "fridge"}`，然后 `calculateShelfLife("fruit", "fridge", ...)` 匹配到 **第一个** fruit+fridge 规则（苹果 = 21 天），而非草莓的 3 天。

**根因:** 分类结果与规则引用断裂，calculator 按 category+zone 匹配而非按具体食品。

**修复:**
- `classifyFood` 返回 `matchedRuleKeyword`
- `calculateShelfLife` 新增可选 `matchedKeyword` 参数，优先按关键词查找规则
- `FoodForm` 使用 `matchedKeywordRef` 缓存关键词，zone/opened 变更时正确传递
- `receipt.service.ts` / `receipts/import/page.tsx` 同步更新

**验证 (新测试):**

| 食品 | 分类 | 存放 | 期望天数 | 实际 |
|------|------|------|----------|------|
| 猪肉 | meat | fridge | 3 | ✅ |
| 牛奶 | dairy | fridge | 14 | ✅ |
| 鸡蛋 | egg | fridge | 30 | ✅ |
| 苹果 | fruit | fridge | 21 | ✅ |
| 草莓 | fruit | fridge | 3 | ✅ |
| 香蕉 | fruit | room | 5 | ✅ |
| 剩菜 | leftover | fridge | 2 | ✅ |
| 面包 | grain | room | 5 | ✅ |
| 未识别 | other | fridge | 7 | ✅ |
| 草莓 vs 苹果 | - | - | 不同 | ✅ |

## 3. 小票导入确认页

**变更:**
- `RecognizedItemsList` 新增分类下拉框、存放位置三选一按钮、到期日期输入
- 名称失焦触发重新分类 (`onNameBlur`)
- 移除 `Badge` 依赖，改用交互式控件

## 4. 数据模型 (Dexie v1 → v2)

**新增字段:**

| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| `referenceShelfLifeDays` | number? | 自动计算的参考保质天数 | 否 |
| `matchedRuleKeyword` | string? | 匹配到的规则关键词 | 是 |
| `source` | string? | 录入来源: manual/receipt_mock/receipt_ocr | 是 |
| `receiptId` | string? | 关联小票 ID | 是 |

向后兼容：新增字段均为可选，v1 记录无需迁移。

## 5. 测试覆盖

| 文件 | 用例数 | 覆盖内容 |
|------|--------|----------|
| shelf-life-calculator.test.ts | 8 | 基础计算器逻辑 |
| classification.test.ts | 13 | 分类识别 |
| per-food-shelf-life.test.ts | 14 | per-food 集成 + matchedKeyword + 开封 + 手动日期 |
| **合计** | **42** | |

## 6. 已知限制 (V1 设计范围外)

- 小票识别仍为模拟数据
- 无用户/家庭共享
- 无云端同步
- 无推送通知
- 离线数据导出未实现
