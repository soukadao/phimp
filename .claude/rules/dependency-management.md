# Dependency Management

ライブラリを追加・変更する場合:

1. package.json の既存の依存関係を確認する
2. 本番依存か開発依存かを判断する
3. パッケージマネージャーのコマンドでインストールする（package.json を直接編集しない）
   - `bun add <package>` / `bun add -d <package>`
   - `pnpm add <package>` / `pnpm add -D <package>`
   - `npm install <package>` / `npm install -D <package>`
4. TypeScript の型定義が必要か確認し、必要なら `@types/xxx` をインストールする
