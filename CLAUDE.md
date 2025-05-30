# Claude Code 協働開発ガイドライン

## プロジェクト概要
TODOアプリケーション - フロントエンド
- **リポジトリ**: todo-app-frontend
- **技術スタック**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **目的**: 直感的で使いやすいTODO管理インターフェースの提供

## 開発ルール

### 1. コーディング規約

#### TypeScript
- 厳格な型定義を使用 (`strict: true`)
- 型推論が明確な場合は省略可、公開APIの関数は必ず型定義
- `any`型の使用禁止（やむを得ない場合は`unknown`を使用し、型ガードで絞り込む）
- インターフェースは`I`プレフィックスを付けない
- 型定義は使用箇所の近くに配置（共通型のみ`types/`ディレクトリ）
- Enum の代わりに const assertion を使用
```typescript
// Good
export const TodoStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE'
} as const;
type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus];
```

#### React/Next.js
- 関数コンポーネントのみ使用（React.FCは使用しない）
- コンポーネントは1ファイル1エクスポート
- コンポーネントファイル名はPascalCase（例: `TodoItem.tsx`）
- カスタムフックは`use`プレフィックスを付ける（例: `useTodos.ts`）
- Server ComponentsとClient Componentsを明確に分離
- `'use client'`ディレクティブは必要最小限のコンポーネントに適用
- Props の命名は明確に（onClick ではなく onTodoClick など）

#### Tailwind CSS
- デザイントークンを活用（色、スペーシング、フォントサイズ）
- 再利用可能なコンポーネントはCSSモジュールまたはtwin.macroを検討
- レスポンシブデザインはモバイルファースト
- ダークモード対応は`dark:`プレフィックスを使用
- 長いクラス名はcn()ユーティリティで整理

### 2. コミットメッセージ規約（Conventional Commits）
```
<type>(<scope>): <subject>

<body>

<footer>
```

**タイプ**:
- `feat`: 新機能（ユーザーに見える変更）
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマット等）
- `refactor`: バグ修正や機能追加を伴わないコード変更
- `perf`: パフォーマンス改善
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更
- `build`: ビルドシステムや外部依存関係の変更
- `ci`: CI設定ファイルとスクリプトの変更

**コミット粒度の原則**:
- 1つのコミットは1つの論理的な変更単位
- レビュー可能な大きさに保つ（差分200行以内を目安）
- 機能追加とリファクタリングは別コミット
- 自動フォーマットの変更は別コミット

**良い例**:
```
feat(todo): 優先度によるソート機能を追加

TodoListコンポーネントに優先度でソートする機能を実装。
高→中→低の順序で自動的にソートされる。

- useTodosフックにsortByPriority関数を追加
- TodoListでソート済みのTODOを表示
- ソート順の永続化はlocalStorageで実装

Closes #12
```

**悪い例**:
```
feat: いろいろ修正

TODOアプリの修正とバグフィックスとスタイル調整
```

### 3. ブランチ戦略（GitHub Flow）
- `main`: 本番環境にデプロイ可能な状態を維持
- `feature/*`: 新機能開発（例: `feature/add-priority`）
- `fix/*`: バグ修正（例: `fix/todo-deletion-error`）
- `refactor/*`: リファクタリング（例: `refactor/optimize-state-management`）

### 4. Claude Codeへの依頼方法

**依頼テンプレート**:
```markdown
## 実装したい機能
[機能の概要を具体的に記載]

## 現在の状況
[関連するファイルや既存の実装を説明]

## 期待する結果
[完成後の動作や表示を説明]

## 制約事項
[守るべきルールや考慮事項]
```

**効果的な依頼のポイント**:
- 具体的なファイルパスを明記
- UI/UXの要望は視覚的に説明（可能ならスケッチや参考画像）
- パフォーマンス要件がある場合は明記

### 5. コードレビューポイント
- [ ] TypeScriptの型安全性が保たれているか
- [ ] コンポーネントの責務が単一か
- [ ] 適切なServer/Client Componentsの使い分け
- [ ] アクセシビリティ（a11y）への配慮
- [ ] レスポンシブデザインの実装
- [ ] 不要な再レンダリングがないか
- [ ] エラーハンドリングが適切か

### 6. テスト方針

#### テスト戦略
- **単体テスト**: Jest + React Testing Library
  - ユーティリティ関数、カスタムフック
  - 純粋なロジックを含むコンポーネント
- **統合テスト**: React Testing Library
  - ユーザーインタラクション
  - コンポーネント間の連携
- **E2Eテスト**: Playwright
  - クリティカルユーザージャーニー
  - クロスブラウザテスト

#### テスト設計原則
- AAA パターン（Arrange, Act, Assert）を使用
- テストはユーザー視点で記述（実装の詳細ではなく振る舞いをテスト）
- data-testid は最終手段（アクセシブルなクエリを優先）
- モックは最小限に（実際のデータ構造を使用）

#### カバレッジ目標
- 全体: 80%以上
- ビジネスクリティカルなロジック: 100%
- UIコンポーネント: 70%以上
- ユーティリティ関数: 100%

#### テストファイルの配置
```
src/
├── components/
│   └── TodoItem/
│       ├── TodoItem.tsx
│       ├── TodoItem.test.tsx    # 単体・統合テスト
│       └── TodoItem.stories.tsx  # Storybook
└── __tests__/
    └── e2e/
        └── todo-crud.spec.ts     # E2Eテスト
```

## 技術仕様

### 使用技術スタック
```json
{
  "framework": "Next.js 14+ (App Router)",
  "language": "TypeScript 5+",
  "styling": "Tailwind CSS 3+",
  "stateManagement": "Zustand or TanStack Query",
  "formHandling": "React Hook Form + Zod",
  "testing": "Jest, React Testing Library, Playwright",
  "linting": "ESLint, Prettier",
  "packageManager": "npm"
}
```

### アーキテクチャパターン
```
src/
├── app/                  # App Router pages
│   ├── (auth)/          # 認証が必要なルート
│   ├── api/             # API Routes
│   ├── layout.tsx
│   └── page.tsx
├── components/          # UIコンポーネント
│   ├── ui/              # 基本UIコンポーネント（Button, Input等）
│   ├── features/        # 機能別コンポーネント
│   │   └── todo/        # TODO機能関連
│   └── layouts/         # レイアウトコンポーネント
├── hooks/               # カスタムフック
├── lib/                 # 外部ライブラリの設定
├── services/            # API通信ロジック
│   ├── api/             # APIクライアント
│   └── todos.ts         # TODO関連のAPI呼び出し
├── stores/              # 状態管理
├── types/               # 共通型定義
├── utils/               # ユーティリティ関数
└── config/              # アプリケーション設定
```

#### ファイル命名規則
- コンポーネント: PascalCase（`TodoItem.tsx`）
- ユーティリティ: camelCase（`formatDate.ts`）
- 型定義: PascalCase（`Todo.types.ts`）
- 定数: UPPER_SNAKE_CASE（`API_ENDPOINTS.ts`）

### API設計規約
- RESTful APIを使用
- エンドポイント: `http://localhost:8080/api/v1/*`
- 認証: JWT Bearer Token
- エラーレスポンス形式:
```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}
```

### エラーハンドリング方針

#### エラーの分類と処理
1. **ネットワークエラー**
   - 自動リトライ（指数バックオフ、最大3回）
   - オフライン時はキューに保存
   - ユーザーに再試行オプションを提供

2. **バリデーションエラー**
   - フィールドレベルでインラインエラー表示
   - リアルタイムバリデーション（debounce付き）

3. **システムエラー**
   - Error Boundaryでキャッチ
   - ユーザーフレンドリーなフォールbackUI
   - Sentryなどでエラー追跡

#### エラー表示の原則
- 具体的で実行可能なメッセージ
- 技術的詳細は開発環境のみ
- トースト通知は一時的エラーのみ
- 永続的エラーはインライン表示

## プロジェクト固有ルール

### TODOアプリの機能要件
1. **基本機能**
   - TODOの作成、読取、更新、削除（CRUD）
   - TODOのステータス管理（未着手、進行中、完了）
   - 優先度設定（高、中、低）

2. **応用機能**
   - カテゴリー分類
   - 期限設定とリマインダー
   - 検索・フィルタリング
   - ドラッグ&ドロップでの並び替え

3. **ユーザー体験**
   - オフライン対応（PWA）
   - リアルタイム同期
   - ダークモード
   - 多言語対応（i18n）

### 将来的な技術スタック置き換えを考慮した設計指針
1. **疎結合な設計**
   - ビジネスロジックとUIの分離
   - 依存性注入パターンの活用
   - インターフェースベースの実装

2. **抽象化レイヤー**
   - API通信はサービスレイヤーで抽象化
   - 状態管理ライブラリへの直接依存を最小化
   - スタイリングシステムの抽象化

3. **マイグレーション容易性**
   - 機能単位でのモジュール化
   - 十分なテストカバレッジ
   - 明確なドキュメント

## 開発開始時の確認事項
```bash
# 環境確認
node --version  # v18.19.1以上
npm --version   # 9.2.0以上

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド
npm run build

# リント
npm run lint
```

## Claude Codeとの連携
このファイルはClaude Codeが参照し、プロジェクトのコンテキストを理解するために使用されます。
開発方針に変更がある場合は、このファイルを更新してください。