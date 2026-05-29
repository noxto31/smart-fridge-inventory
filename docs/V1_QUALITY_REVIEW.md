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

---

# V1.0.2 检查章节

审查日期: 2026-05-29  
基线提交: `12a9eb9` (V1.0.1)

## 1. 关键词匹配优先级

**问题:** `classifyFood` 按数组顺序返回第一个 `includes()` 匹配，短关键词会抢先命中。

**修复:** 改为「最长关键词优先」——遍历所有规则，取 `keyword.length` 最大的匹配。同长度取数组先出现的条目。

| 输入 | 旧结果 | 新结果 |
|------|--------|--------|
| 三文鱼 | 鱼(seafood) | 三文鱼(seafood) ✅ |
| 番茄酱 | 番茄(vegetable) | 番茄酱(condiment) ✅ |
| 辣椒酱 | 辣椒(vegetable) | 辣椒酱(condiment) ✅ |
| 速冻饺子 | 饺子(grain) | 饺子(grain) ✅ (同长度取先出现) |

## 2. 小票导入 expirySource 保留

**问题:** `handleConfirmImport` 硬编码 `expirySource: "auto"`。

**修复:** 改为 `item.expirySource ?? "auto"`。

## 3. 手动修改保护

**问题:** `handleNameBlur` 重新分类时覆盖用户已手动调整的字段。

**修复:** 
- `ReceiptItem` 新增 `manualOverrides?: { category?, storageZone?, expiryDate? }`
- 手动修改时设置标记
- `handleNameBlur` 仅更新未标记的字段
- 新增"恢复自动建议"操作

## 4. 分类默认保质期

**问题:** `calculateShelfLife` 无具体规则匹配时使用 `shelfLifeRules.find(category)` 取第一条具体规则。

**修复:** 新增 `CATEGORY_DEFAULT_SHELF_LIFE`，12 个分类各有独立默认值。优先级链：
1. 手动到期日期
2. 命中的具体食品规则 (by keyword)
3. 分类默认参考规则 (CATEGORY_DEFAULT_SHELF_LIFE)
4. 全局存放位置兜底 (DEFAULT_SHELF_LIFE)

## 5. 测试覆盖

| 文件 | 用例数 | 新增内容 |
|------|--------|----------|
| classification.test.ts | 17 | +4 关键词优先级 |
| shelf-life-calculator.test.ts | 15 | 更新分类默认值期望 |
| per-food-shelf-life.test.ts | 20 | +2 优先级保质期, +4 分类兜底 |
| receipt-override.test.ts | 7 | +7 手动修改保护 |
| **合计** | **59** | **+17** |

## 6. CI

- `.github/workflows/ci.yml` 已创建
- 触发条件: push / pull_request → master
- 步骤: npm ci → lint → typecheck → test → build

## 7. 版本记录

- `package.json`: `1.0.2` ✅
- `CHANGELOG.md`: 已创建 ✅
- `ITERATION_LOG.md`: V1.0.2 条目已追加 ✅
- Git Tag: 待提交后创建
