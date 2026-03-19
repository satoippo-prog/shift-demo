# シフト簡単調整ツール — デモ

医療機関・介護施設・整体院向けの勤務シフト管理ツールのプロトタイプです。

## 機能

### 管理者画面
- 月次・週次・日次・サマリー・希望一覧の5ビュー
- スタッフ管理（常勤/パート/時短対応）
- 職種管理・シフト枠カスタマイズ
- 最低人員チェック＋アラート
- シフト確定・ロック（管理者認証）
- 希望募集コントロール（最大2ヶ月同時）
- 修正リクエストの承認/却下
- A4横向き印刷対応

### 従業員画面
- 第1・第2希望の入力
- 時短/パート対応（割当可能シフトのみ表示）
- 月ターゲティング（管理者が指定した月のみ入力可能）
- 締切後の修正リクエスト

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. ローカルで確認

```bash
npm run dev
```

ブラウザで http://localhost:5173/shift-demo/ を開く

### 3. ビルド

```bash
npm run build
```

## GitHub Pages にデプロイ

### 初回設定

1. GitHubにリポジトリ `shift-demo` を作成（Public）
2. pushする:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shift-demo.git
git push -u origin main
```

3. GitHub リポジトリの Settings → Pages → Source を **GitHub Actions** に変更
4. 自動でビルド＆デプロイされる
5. `https://YOUR_USERNAME.github.io/shift-demo/` でアクセス可能

### 更新時

```bash
git add .
git commit -m "update"
git push
```

pushするたびに自動デプロイされます。

## デモの使い方

| 画面 | アクセス |
|------|----------|
| トップ | `#/` |
| 管理者 | `#/admin` |
| 従業員 | `#/staff` |

- **管理者PW**: `admin123`（確定後の調整モード用）
- **従業員ログイン**: ID `1`〜`22` / PW `0000`

## ⚠ リポジトリ名を変える場合

`vite.config.js` の `base` を変更してください:

```js
base: '/YOUR_REPO_NAME/',
```

---

Powered by LFU Inc.
