# CLAUDE.md — シフト管理SaaSデモ

## プロジェクト概要

医療機関・介護施設向けのシフト管理SaaSツール。
管理者がシフト表を作成・調整し、スタッフが希望を提出するWebアプリ。

**商品化を目指して開発中（2026年〜）**

## 技術スタック

| 項目 | 内容 |
|------|------|
| フロントエンド | React 18 + Vite 6 |
| バックエンド | Supabase（PostgreSQL + Auth + Realtime） |
| スタイリング | インラインスタイル（CSS-in-JS、Tailwind未使用） |
| ルーティング | ハッシュベース（`#/`, `#/admin`, `#/staff`） |
| デプロイ予定 | Vercel（GitHub Pages から移行予定） |

## ディレクトリ構成

```
shift-demo/
├── src/
│   ├── App.jsx                  # ルーティング + ランディングページ
│   ├── demoSeed.js              # 旧localStorage用シード（参照のみ、使用停止）
│   ├── lib/
│   │   ├── supabase.js          # Supabaseクライアント（シングルトン）
│   │   └── resetDemo.js         # ブラウザからデモデータをリセットする関数
│   └── pages/
│       ├── ShiftManager.jsx     # 管理者画面（シフト作成・希望集計・設定）
│       └── StaffShiftRequest.jsx # スタッフ画面（希望提出）
├── scripts/
│   └── seedSupabase.js          # Node.js用デモデータ投入スクリプト
├── .env                         # Supabase認証情報（gitignore済み）
└── vite.config.js               # base: '/shift-demo/'
```

## 環境変数（.env）

```
VITE_SUPABASE_URL=https://gwauirksohqodferihfv.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_FACILITY_ID=4949f3de-ac50-4e95-8eea-5d03662c5826
```

`.env` は `.gitignore` で除外済み。絶対にコミットしない。

## 開発サーバー起動

```bash
cd shift-demo/shift-demo
npm run dev
# → http://localhost:5173/shift-demo/
```

## デモデータの初期投入・リセット

### ブラウザから（推奨）
トップページ（`#/`）の「デモをリセット」ボタンを押す。

### Node.jsスクリプトから（初回のみ）
```bash
node scripts/seedSupabase.js
```
※ 新しい facility_id が発行されるので `.env` の `VITE_FACILITY_ID` を更新すること。

## Supabaseテーブル構成

| テーブル | 内容 |
|----------|------|
| `facilities` | 施設マスタ（マルチテナントのルート） |
| `staff_members` | スタッフ（id: serial, 1〜22） |
| `roles` | 職種定義（doctor, nurse, reception, tech, pt, assistant） |
| `shift_types` | シフト種別（early, day, late, morning, short, off） |
| `min_staff` | 職種ごとの最低必要人数 |
| `shift_assignments` | 実際のシフト割当（date: ISO文字列） |
| `collections` | 希望収集期間（target_month: 0-indexed） |
| `pref_data` | スタッフの希望データ（pref1, pref2） |
| `mod_requests` | 締切後の修正リクエスト |
| `locked_months` | 月の確定・ロック状態 |

**重要**: `collections.target_month` は **0-indexed**（0=1月, 3=4月）。
表示時は `targetMonth + 1` で月番号にする。

## マルチテナント設計

全テーブルに `facility_id UUID` カラムがある。
すべてのクエリで `.eq('facility_id', FID)` を必ずつける。

```js
const FID = import.meta.env.VITE_FACILITY_ID
```

## 主要な実装パターン

### Supabaseクエリ（基本形）
```js
const { data, error } = await supabase
  .from('テーブル名')
  .select('*')
  .eq('facility_id', FID)
```

### Upsert（重複時は更新）
```js
await supabase.from('shift_assignments').upsert(
  { facility_id: FID, staff_id, date, shift_type },
  { onConflict: 'facility_id,staff_id,date' }
)
```

### シフトの内部キー形式
```
"staffId-year-m0-day"  例: "1-2026-3-15"（4月15日、m0=3）
```

### stale closure 対策
`handleToggle` など頻繁に呼ばれるコールバックは `useRef` でシフトデータを保持：
```js
const shiftsRef = useRef({})
useEffect(() => { shiftsRef.current = shifts }, [shifts])
```

## 画面構成

| URL | 画面 | 認証 |
|-----|------|------|
| `#/` | ランディング | なし |
| `#/admin` | シフト管理（管理者） | PW: admin123 |
| `#/staff` | 希望提出（スタッフ） | ID 1〜22 / PW 0000 |

## 現在のフェーズと今後のロードマップ

### 完了済み
- ✅ Phase 0: デモUI実装（localStorage）
- ✅ Phase 1: Supabase移行（DB・マルチテナント基盤）

### 今後
- ⬜ Phase 2: Supabase Auth（管理者ログイン）+ RLS設定 + Vercelデプロイ
- ⬜ Phase 3: Stripe課金（月額サブスクリプション）
- ⬜ Phase 4: 通知（メール/LINE）・PDF出力・モバイル最適化

## 注意事項

- **RLS未設定**：現在すべてのテーブルが UNRESTRICTED。本番前に必ず設定する。
- **GitHub Pages のワークフロー**（`.github/workflows/deploy.yml`）は現在 `.env` なしでビルドされるため機能しない。Vercel移行まで放置でよい。
- `demoSeed.js`（src配下）は旧localStorage版。削除しないが使用しない。
- インラインスタイルが多いが、既存コードに合わせてインラインで統一する。外部CSSクラスは追加しない。
