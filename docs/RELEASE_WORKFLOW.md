# 版本发布工作流说明

## 版本基线

当前基线版本：**v1.0.2**（`package.json` → `"version": "1.0.2"`）

| Tag | 提交 | 说明 |
|-----|------|------|
| v1.0.0 | `e5234b3` | 初始功能版本 |
| v1.0.1 | `12a9eb9` | 核心逻辑稳定化 |
| v1.0.2 | `bba7f68` | 规则准确性与手动修改保护 |

## 默认分支

`master`

## Release Please 工作方式

本仓库使用 [googleapis/release-please-action@v4](https://github.com/googleapis/release-please-action) 自动管理版本。

工作流程如下：

1. 开发者向 `master` 分支提交符合 Conventional Commits 规范的 commit。
2. Release Please 监听 `master` 分支的 push 事件。
3. 如果存在尚未发布的 `fix:` / `feat:` / `feat!:` commit，Release Please 自动创建（或更新）一个 **Release PR**。
4. Release PR 中包含：
   - `package.json` 版本号变更
   - `docs/CHANGELOG.md` 更新
5. 维护者审查并合并 Release PR。
6. 合并后 Release Please 自动：
   - 创建对应版本的 Git Tag（如 `v1.1.0`）
   - 创建 GitHub Release（附带 Release Notes）

## Commit 规范

所有 commit 必须遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 常用前缀

| 前缀 | 含义 | 版本影响 | 示例 |
|------|------|----------|------|
| `fix:` | 修复错误 | Patch (1.0.2 → 1.0.3) | `fix: resolve date parsing timezone issue` |
| `feat:` | 新增功能 | Minor (1.0.2 → 1.1.0) | `feat: add barcode scanning support` |
| `feat!:` | 不兼容变更 | Major (1.0.2 → 2.0.0) | `feat!: redesign data model with breaking schema change` |
| `docs:` | 文档更新 | 不触发版本 | `docs: update README with new screenshots` |
| `test:` | 测试相关 | 不触发版本 | `test: add edge case tests for expiry calculator` |
| `chore:` | 工程维护 | 不触发版本 | `chore: update dependencies` |
| `ci:` | CI/CD 配置 | 不触发版本 | `ci: add release-please workflow` |
| `refactor:` | 重构 | 不触发版本 | `refactor: extract classification into separate module` |

### 不兼容变更标记

在 commit 正文中包含 `BREAKING CHANGE:` 也会触发 Major 版本升级：

```
feat: change storage backend

BREAKING CHANGE: IndexedDB schema v3 is not backward compatible with v2 data.
```

## CI 与发布流程的关系

```
push to master
     │
     ▼
┌─────────┐     ┌──────────────────┐
│  CI 检查  │────▶│ Release Please    │
│ lint     │     │ 创建/更新 Release  │
│ typecheck│     │ PR (如有新 commit) │
│ test     │     └────────┬─────────┘
│ build    │              │
└─────────┘        合并 Release PR
                          │
                   ┌──────┴──────┐
                   │ 自动创建      │
                   │ • Git Tag    │
                   │ • GitHub     │
                   │   Release    │
                   └─────────────┘
```

- 普通 commit 推送到 `master` 后，CI（`ci.yml`）先运行质量检查。
- Release Please（`release-please.yml`）在同一 push 事件中并行运行。
- 如果 CI 失败，应当修复后再合并 Release PR。
- Release PR 本身也会触发 CI 检查（因为它是对 `master` 的 PR）。

## 权限要求

### 当前配置（使用 GITHUB_TOKEN）

Release Please workflow 使用 `${{ secrets.GITHUB_TOKEN }}`，这是 GitHub Actions 自动提供的内置 token。

**已具备的权限：**
- 读取仓库内容
- 创建和更新 Pull Request
- 创建 Git Tag
- 创建 GitHub Release

### 已知限制

`GITHUB_TOKEN` 创建的 Pull Request **不会触发其他 workflow**（如 CI 检查）。这意味着：
- Release Please 创建的 Release PR 不会自动触发 `ci.yml`。
- 如果需要 Release PR 也能触发 CI，需要配置 Fine-grained PAT（见下文）。

### 可选升级：Fine-grained PAT

如果需要 Release PR 也能触发 CI workflow，执行以下步骤：

1. 在 GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens 中创建 token。
2. 权限范围选择当前仓库，授予：
   - `Contents: Read and write`
   - `Pull requests: Read and write`
   - `Issues: Read and write`
   - `Metadata: Read`
3. 在仓库 Settings → Secrets and variables → Actions 中创建 Secret：
   - 名称：`RELEASE_PLEASE_TOKEN`
   - 值：上一步创建的 token
4. 修改 `.github/workflows/release-please.yml` 中的 token：
   ```yaml
   token: ${{ secrets.RELEASE_PLEASE_TOKEN }}
   ```

**注意：** 不得将真实 token 写入代码、文档示例或提交记录。

## 安全规则

1. **禁止覆盖已存在的 Git Tag。** 已发布的版本不可修改。
2. **禁止将真实密钥提交到仓库。** Token、PAT、API Key 必须通过 GitHub Secrets 管理。
3. **禁止绕过 CI 直接发布。** 所有发布版本必须通过 lint、typecheck、test、build 检查。
4. **禁止编造历史版本 Release Notes。** 只基于真实提交内容生成。

## 日常开发工作流

```bash
# 1. 从 master 创建功能分支
git checkout master
git pull
git checkout -b feat/my-feature

# 2. 开发并提交（使用 conventional commits）
git add .
git commit -m "feat: add ingredient recognition from photo"

# 3. 推送并创建 PR
git push -u origin feat/my-feature
# 在 GitHub 上创建 PR，等待 CI 通过后合并

# 4. 合并到 master 后
# - Release Please 自动创建/更新 Release PR
# - 维护者审查 Release PR 中的版本号和 CHANGELOG
# - 合并 Release PR → 自动创建 Tag + GitHub Release
```

## 配置文件说明

| 文件 | 说明 |
|------|------|
| `release-please-config.json` | Release Please 配置（release-type、CHANGELOG 路径等） |
| `.release-please-manifest.json` | 版本基线映射（当前: `"." : "1.0.2"`） |
| `.github/workflows/release-please.yml` | Release Please GitHub Actions 工作流 |
| `.github/workflows/ci.yml` | 原有 CI 检查工作流（保留不变） |
