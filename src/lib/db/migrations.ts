import { db } from "./index";

/**
 * 数据库迁移占位文件
 * 当需要升级 schema 时，在此添加 db.version(N).stores({...})
 * 每个新版本必须是前一个版本 schema 的超集
 */

export async function runMigrations(): Promise<void> {
  // 当前无迁移，Dexie 自动处理 version 1
}
