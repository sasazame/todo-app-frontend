# Claude Code 協働開発ガイドライン

## プロジェクト概要
TODOアプリケーション - フロントエンド
- **技術スタック**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS
- **状態管理**: TanStack Query + React Hook Form
- **テスト**: Jest, React Testing Library, Playwright
- **目的**: 直感的で使いやすいTODO管理インターフェース

## 開発フロー（重要）
```bash
# 1. 新機能開発時はfeatブランチを作成
git checkout -b feat/feature-name

# 2. 実装・テスト・コミット
npm run lint && npm test && git add . && git commit -m "feat: 機能の説明"

# 3. GitHubにプッシュしてPRを作成（宛先: sasazame）
git push origin feat/feature-name
gh pr create --title "機能タイトル" --body "詳細説明" --assignee sasazame
```

## コーディング規約

### TypeScript
- `strict: true`、`any`禁止（`unknown`+型ガードを使用）
- const assertion使用（Enumの代わり）
- React.FC使用禁止、1ファイル1エクスポート
- Props命名は明確に（`onTodoClick`等）

### React/Next.js
- Server Components優先、`'use client'`は最小限
- カスタムフック: `use`プレフィックス
- ファイル名: PascalCase（`TodoItem.tsx`）

### Tailwind CSS
- モバイルファースト、`dark:`対応
- デザイントークン活用
- `cn()`ユーティリティで整理

## プロジェクト構造
```
src/
├── app/                 # App Router pages
├── components/
│   ├── ui/             # 基本UIコンポーネント
│   └── features/       # 機能別コンポーネント
├── hooks/              # カスタムフック
├── lib/                # 外部ライブラリ設定
├── services/           # API通信
├── types/              # 共通型定義
└── utils/              # ユーティリティ
```

## コミット規約
```
<type>(<scope>): <subject>

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```
**タイプ**: feat, fix, docs, style, refactor, perf, test, chore

## テスト方針
- 単体: Jest + RTL（ユーティリティ、フック）
- 統合: RTL（ユーザーインタラクション）
- E2E: Playwright（クリティカルパス）
- AAA パターン、ユーザー視点でテスト

## API連携
- バックエンドURL: `http://localhost:8080/api/v1`
- TanStack Query使用
- エラーハンドリング: Error Boundary + トースト

## 重要な実装パターン
1. **Server Components**: デフォルト、データフェッチ
2. **Client Components**: インタラクション必要時のみ
3. **状態管理**: TanStack Query（サーバー状態）+ useState（ローカル状態）
4. **フォーム**: React Hook Form + Zod
5. **エラー**: Error Boundary + 適切なフォールバック

## Claude Codeへの依頼テンプレート
```markdown
## 実装したい機能
[UI/UX要件を具体的に記載]

## 現在の状況
[関連コンポーネント、既存実装]

## 期待する結果
[画面の動作、ユーザー体験]

## デザイン要件
[レスポンシブ、アクセシビリティ要件]
```

## 開発時チェックリスト
- [ ] featブランチで作業
- [ ] TypeScript型安全性
- [ ] Server/Client Components適切な分離
- [ ] レスポンシブデザイン
- [ ] アクセシビリティ（a11y）
- [ ] エラーハンドリング
- [ ] テスト作成
- [ ] lint/build成功
- [ ] PR作成（assignee: sasazame）

## 開発コマンド
```bash
npm run dev          # 開発サーバー（Turbopack）
npm run build        # プロダクションビルド
npm run lint         # ESLint実行
npm test             # Jest単体テスト
npm run test:e2e     # Playwright E2Eテスト
```

## 環境・設定
- Node.js 18+, npm 9+
- バックエンド連携: localhost:8080
- 主要パッケージ: package.jsonを参照

このファイルはClaude Codeが効率的に作業するための簡潔なガイドライン。
詳細な設計情報は`README.md`および`docs/`フォルダーを参照。