# 数据模型文档

## 核心实体

### FoodItem（食品库存记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | UUID，主键 |
| name | string | 食品名称 |
| category | FoodCategory | 食品分类 |
| storageZone | StorageZone | 存放位置 |
| quantity | number | 数量 |
| unit | string | 单位（个、克、袋、盒等） |
| purchaseDate | string | 购买日期 (ISO) |
| expiryDate | string | 参考到期日期 (ISO) |
| opened | boolean | 是否已开封 |
| note | string? | 备注 |
| status | ItemStatus | 状态：active/eaten/discarded |
| expirySource | "auto"/"manual" | 到期日期来源 |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |
| disposedAt | string? | 处理时间 |
| referenceShelfLifeDays | number? | 自动计算的参考保质天数 |
| matchedRuleKeyword | string? | 匹配到的规则关键词 |
| source | string? | 录入来源：manual/receipt_mock/receipt_ocr |
| receiptId | string? | 关联的小票导入记录 ID |

### ReceiptImport（小票导入记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | UUID，主键 |
| imagePreview | string? | 图片预览 |
| recognizedItems | ReceiptItem[] | 识别的商品列表 |
| createdAt | string | 创建时间 |
| status | "pending"/"confirmed"/"cancelled" | 状态 |
| source | "mock"/"ocr" | 识别来源 |

### ShelfLifeRule（保存规则）

| 字段 | 类型 | 说明 |
|------|------|------|
| keyword | string | 匹配关键词 |
| category | FoodCategory | 食品分类 |
| recommendedStorageLocation | StorageZone | 建议存放位置 |
| shelfLifeByStorage | Record<StorageZone, number> | 按存放位置的保质天数 |
| openedAdjustment | number | 开封后保质期缩减比例 |
| referenceNote | string? | 备注 |

## IndexedDB Schema (Dexie v2)

```
foodItems: id, name, category, storageZone, status, expiryDate, purchaseDate, createdAt, updatedAt, source, receiptId, matchedRuleKeyword
receipts: id, createdAt
```

## 未来迁移到云端注意事项

1. `id` 字段使用 UUID，与大多数云端数据库兼容
2. 日期字段使用 ISO 字符串，便于跨时区处理
3. 数据访问层已封装在 services 中，替换存储后端只需修改 service 实现
4. `status` 字段使用枚举字符串，便于扩展
5. 需要新增 `userId` 和 `familyId` 字段以支持多用户
6. 需要实现数据同步冲突解决策略
