# Changelog

All notable changes to this project will be documented in this file.

> **Note:** From v1.0.2 onward, this file is maintained by
> [Release Please](https://github.com/googleapis/release-please-action).
> See [docs/RELEASE_WORKFLOW.md](RELEASE_WORKFLOW.md) for details.

## [1.0.2] - 2026-05-29

### Fixed
- **关键词匹配优先级**: `classifyFood` 现在优先匹配最长关键词（如"三文鱼"优先于"鱼"，"番茄酱"优先于"番茄"）；同长度关键词取规则库中先出现的
- **小票导入人工修改保留**: `handleConfirmImport` 不再硬编码 `expirySource: "auto"`，保留用户手动修改来源
- **小票确认页手动修改保护**: 新增 `ReceiptItem.manualOverrides`，已手动修改的分类/存放位置/到期日不会被重新分类覆盖；新增"恢复自动建议"按钮
- **分类默认保质期**: 新增 `CATEGORY_DEFAULT_SHELF_LIFE`，未识别食品不再套用同分类中第一条具体食品的保质期

### Added
- GitHub Actions CI 工作流 (`.github/workflows/ci.yml`)
- `CHANGELOG.md` 版本索引
- 7 条关键词优先级测试、7 条手动修改保护测试、4 条分类兜底测试

### Changed
- `package.json` 版本号更新为 `1.0.2`

## [1.0.1] - 2026-05-29

Commit: `12a9eb9`

### Fixed
- ESLint 迁移为 flat config，适配 Next.js 16 + 中文目录
- 保质期规则匹配: `calculateShelfLife` 支持 `matchedKeyword` 参数
- 小票导入确认页: 可编辑分类、存放位置、到期日期
- 数据模型: 新增 `referenceShelfLifeDays`、`matchedRuleKeyword`、`source`、`receiptId`

### Added
- Dexie v2 schema migration
- 14 条 per-food 保质期集成测试
- `V1_QUALITY_REVIEW.md`

## [1.0.0] - 2026-05-28

Commit: `e5234b3`

### Added
- 初始功能版本
- Next.js 16 + TypeScript + Tailwind CSS v4 + Dexie.js
- 手动添加食品、库存列表、食品详情编辑
- 小票模拟导入
- 临期概览、存储区域卡片
- 历史记录页面
- 保质期规则库 (70+ 食品)
- 底部导航栏、保质期免责声明
- 单元测试 (28 条)
