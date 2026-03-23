-- ============================================================
-- RLS (Row Level Security) セットアップ
-- Supabase Dashboard > SQL Editor で実行する
-- ============================================================

-- ── 1. 管理者の facility_id を取得するヘルパー関数 ──────────
-- 管理者アカウントは Supabase Auth で作成し、
-- app_metadata に { "facility_id": "<UUID>" } を設定すること
-- （設定方法は下部の「管理者アカウント作成手順」を参照）

CREATE OR REPLACE FUNCTION get_my_facility_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'facility_id')::UUID
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ── 2. 全テーブルで RLS を有効化 ──────────────────────────

ALTER TABLE facilities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_types       ENABLE ROW LEVEL SECURITY;
ALTER TABLE min_staff         ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pref_data         ENABLE ROW LEVEL SECURITY;
ALTER TABLE mod_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE locked_months     ENABLE ROW LEVEL SECURITY;


-- ── 3. 管理者専用テーブル（認証必須）──────────────────────
-- 認証済みユーザーは自施設のデータのみ CRUD 可

-- facilities
CREATE POLICY "admin_facilities" ON facilities
  FOR ALL TO authenticated
  USING (id = get_my_facility_id())
  WITH CHECK (id = get_my_facility_id());

-- roles
CREATE POLICY "admin_roles" ON roles
  FOR ALL TO authenticated
  USING (facility_id = get_my_facility_id())
  WITH CHECK (facility_id = get_my_facility_id());

-- shift_types
CREATE POLICY "admin_shift_types" ON shift_types
  FOR ALL TO authenticated
  USING (facility_id = get_my_facility_id())
  WITH CHECK (facility_id = get_my_facility_id());

-- min_staff
CREATE POLICY "admin_min_staff" ON min_staff
  FOR ALL TO authenticated
  USING (facility_id = get_my_facility_id())
  WITH CHECK (facility_id = get_my_facility_id());

-- locked_months
CREATE POLICY "admin_locked_months" ON locked_months
  FOR ALL TO authenticated
  USING (facility_id = get_my_facility_id())
  WITH CHECK (facility_id = get_my_facility_id());


-- ── 4. 管理者書き込み・スタッフ読み込みテーブル ────────────

-- staff_members: 管理者のみ書き込み、スタッフは読み込み可（ログイン時に自分を検索するため）
CREATE POLICY "admin_write_staff_members" ON staff_members
  FOR ALL TO authenticated
  USING (facility_id = get_my_facility_id())
  WITH CHECK (facility_id = get_my_facility_id());

CREATE POLICY "anon_read_staff_members" ON staff_members
  FOR SELECT TO anon
  USING (true);

-- shift_assignments: 管理者のみ書き込み、スタッフは読み込み可
CREATE POLICY "admin_write_shift_assignments" ON shift_assignments
  FOR ALL TO authenticated
  USING (facility_id = get_my_facility_id())
  WITH CHECK (facility_id = get_my_facility_id());

CREATE POLICY "anon_read_shift_assignments" ON shift_assignments
  FOR SELECT TO anon
  USING (true);

-- collections: 管理者のみ書き込み、スタッフは読み込み可（募集期間の確認のため）
CREATE POLICY "admin_write_collections" ON collections
  FOR ALL TO authenticated
  USING (facility_id = get_my_facility_id())
  WITH CHECK (facility_id = get_my_facility_id());

CREATE POLICY "anon_read_collections" ON collections
  FOR SELECT TO anon
  USING (true);


-- ── 5. スタッフ書き込みテーブル ──────────────────────────
-- pref_data: スタッフが希望を投稿するテーブル

CREATE POLICY "admin_pref_data" ON pref_data
  FOR ALL TO authenticated
  USING (facility_id = get_my_facility_id())
  WITH CHECK (facility_id = get_my_facility_id());

CREATE POLICY "anon_write_pref_data" ON pref_data
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- mod_requests: 締切後の修正リクエスト
CREATE POLICY "admin_mod_requests" ON mod_requests
  FOR ALL TO authenticated
  USING (facility_id = get_my_facility_id())
  WITH CHECK (facility_id = get_my_facility_id());

CREATE POLICY "anon_write_mod_requests" ON mod_requests
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 管理者アカウント作成手順
-- ============================================================
--
-- 1. Supabase Dashboard > Authentication > Users > "Add user"
--    - メール: admin@yourfacility.com
--    - パスワード: （任意の強いパスワード）
--    - 「Auto Confirm User」にチェック
--
-- 2. 作成後、そのユーザーの UUID をコピーして以下のSQLを実行:
--
--    UPDATE auth.users
--    SET raw_app_meta_data = raw_app_meta_data ||
--      '{"facility_id": "<YOUR_FACILITY_UUID>"}'::jsonb
--    WHERE id = '<USER_UUID>';
--
--    例:
--    UPDATE auth.users
--    SET raw_app_meta_data = raw_app_meta_data ||
--      '{"facility_id": "4949f3de-ac50-4e95-8eea-5d03662c5826"}'::jsonb
--    WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
--
-- 3. ログアウト → 再ログインして JWT に facility_id が入ることを確認
--
-- ============================================================
