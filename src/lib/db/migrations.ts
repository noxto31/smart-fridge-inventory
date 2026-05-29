/**
 * 数据库迁移文件
 * Dexie version 2 新增字段: source, receiptId, matchedRuleKeyword, referenceShelfLifeDays
 * 迁移在 db/index.ts 中通过 db.version(2).stores(...) 自动完成
 */

export async function runMigrations(): Promise<void> {
  // Dexie 自动处理 version 1 → 2 的 schema 升级
  // 新增字段为可选，已有记录无需数据迁移
}
