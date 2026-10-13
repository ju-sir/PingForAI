# 上游 AI 功能提案

功能已从原作者 `main` 单独整理到正式 fork 的分支：

- Fork: https://github.com/ju-sir/lolPing
- 分支: `feat/configurable-ai-assistance`
- 提交: `00a7095d9df71d02a5e8c1f7be0e3d281b9fa11f`
- 创建 PR: https://github.com/darrenprx/lolPing/compare/main...ju-sir:lolPing:feat/configurable-ai-assistance?expand=1

保留上游品牌、许可证、工作流和打包目标，默认所有 AI 动作关闭。上游分支类型检查、构建及 725 项测试通过，1 项跳过。

2026-10-13 尝试创建 Draft PR 时，GitHub API 返回 `Resource not accessible by personal access token`；应用内浏览器尚未登录 GitHub。因此分支已上传，但 PR 尚未创建。

## 建议标题

Add opt-in AI screenshot assistance with configurable signal prompts

## 建议正文

When users ping content they do not understand, this adds optional screenshot assistance with per-signal prompts and actions. All AI actions are disabled by default. Configure a vision-chat endpoint, model and API key, then show, copy, or show-and-copy an answer.

Requests prioritize a local crop around the signal and include a same-display overview for context, with exact local marker coordinates. The approximate 80/20 split is prompt guidance, not a guaranteed model attention weight. Keys remain in the main process and are encrypted using Electron safeStorage. Settings disclose screenshot uploads. Images do not pass through room messaging or get saved as separate screenshot files. Markdown is sanitized; answers remain in independent windows until manually closed.

The branch is based on upstream main and preserves lolPing branding, license, workflows and release targets. Offered as a draft for feedback on project fit, privacy wording, provider defaults and UX. Analysis instructions and answer controls currently use Chinese; Windows and packaged arm64 execution still need verification.

Validation: TypeScript and production build passed; Vitest reports 725 passed and 1 skipped across 48 files. The Intel test host compiled the unchanged helper sources locally for x86_64; the repository retains its original arm64 target. The related implementation was tested in a real Electron 37 window for Markdown, sanitization, persistence, copying and manual closing. No new live provider request was made during regression verification.
