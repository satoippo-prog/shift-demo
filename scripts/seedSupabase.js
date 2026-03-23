/**
 * Supabase デモデータ投入スクリプト
 * 実行: node scripts/seedSupabase.js
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gwauirksohqodferihfv.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3YXVpcmtzb2hxb2RmZXJpaGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxODkyOTcsImV4cCI6MjA4OTc2NTI5N30.pmRFWk0aM2tOt6iFVkJSXsA5hT6RA25COfWT_naz0EM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/* ── マスターデータ ── */
const ROLES_DEF = [
  { key: 'doctor',    label: '医師',      color: '#0F766E', bg: '#CCFBF1' },
  { key: 'nurse',     label: '看護師',    color: '#1D4ED8', bg: '#DBEAFE' },
  { key: 'reception', label: '受付',      color: '#7E22CE', bg: '#F3E8FF' },
  { key: 'tech',      label: '検査技師',  color: '#C2410C', bg: '#FFF7ED' },
  { key: 'pt',        label: '理学療法士',color: '#15803D', bg: '#DCFCE7' },
  { key: 'assistant', label: '看護助手',  color: '#475569', bg: '#F1F5F9' },
]

const SHIFT_TYPES_DEF = [
  { key: 'early',   label: '早',  name: '早番',  start_hour: 7,  end_hour: 16, color: '#B45309', bg: '#FEF3C7', border_color: '#F59E0B' },
  { key: 'day',     label: '日',  name: '日勤',  start_hour: 9,  end_hour: 18, color: '#1D4ED8', bg: '#DBEAFE', border_color: '#60A5FA' },
  { key: 'late',    label: '遅',  name: '遅番',  start_hour: 11, end_hour: 20, color: '#6D28D9', bg: '#EDE9FE', border_color: '#A78BFA' },
  { key: 'morning', label: '午前',name: '午前',  start_hour: 9,  end_hour: 13, color: '#0F766E', bg: '#CCFBF1', border_color: '#5DCAA5' },
  { key: 'short',   label: '短',  name: '時短',  start_hour: 9,  end_hour: 15, color: '#0369A1', bg: '#E0F2FE', border_color: '#7DD3FC' },
  { key: 'off',     label: '休',  name: '休日',  start_hour: 0,  end_hour: 0,  color: '#DC2626', bg: '#FEE2E2', border_color: '#F87171' },
]

const MIN_STAFF_DEF = [
  { role_key: 'doctor',    minimum: 1 },
  { role_key: 'nurse',     minimum: 3 },
  { role_key: 'reception', minimum: 3 },
  { role_key: 'tech',      minimum: 1 },
  { role_key: 'pt',        minimum: 3 },
  { role_key: 'assistant', minimum: 2 },
]

const STAFF_DEF = [
  { id: 1,  name: '田中 一郎',   role: 'doctor',    emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 2,  name: '佐藤 美咲',   role: 'doctor',    emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 3,  name: '鈴木 健太',   role: 'doctor',    emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 4,  name: '山田 花子',   role: 'nurse',     emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 5,  name: '伊藤 真理',   role: 'nurse',     emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 6,  name: '渡辺 由美',   role: 'nurse',     emp_type: 'shorttime', allowed_shifts: ['morning','short'] },
  { id: 7,  name: '中村 愛',     role: 'nurse',     emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 8,  name: '小林 直子',   role: 'nurse',     emp_type: 'shorttime', allowed_shifts: ['morning','short'] },
  { id: 9,  name: '加藤 恵',     role: 'nurse',     emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 10, name: '吉田 裕子',   role: 'nurse',     emp_type: 'parttime',  allowed_shifts: ['morning','short','day'] },
  { id: 11, name: '松本 さくら', role: 'nurse',     emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 12, name: '高橋 幸子',   role: 'reception', emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 13, name: '林 美穂',     role: 'reception', emp_type: 'parttime',  allowed_shifts: ['morning','short'] },
  { id: 14, name: '清水 陽子',   role: 'reception', emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 15, name: '井上 真由美', role: 'reception', emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 16, name: '木村 太郎',   role: 'tech',      emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 17, name: '斎藤 浩',     role: 'tech',      emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 18, name: '前田 大輔',   role: 'pt',        emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 19, name: '藤田 健',     role: 'pt',        emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 20, name: '岡田 美和',   role: 'assistant', emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
  { id: 21, name: '石井 智子',   role: 'assistant', emp_type: 'parttime',  allowed_shifts: ['morning','short','day'] },
  { id: 22, name: '長谷川 翔',   role: 'assistant', emp_type: 'fulltime',  allowed_shifts: ['early','day','late'] },
]

/* ── シフト生成ロジック（demoSeed.js と同じアルゴリズム） ── */
function getDow(y, m, d) { return new Date(y, m, d).getDay() }
function getDim(y, m)    { return new Date(y, m + 1, 0).getDate() }

function pickShift(s, d, y, m) {
  const dow  = getDow(y, m, d)
  const seed = (s.id * 13 + d * 7) % 11
  const al   = s.allowed_shifts
  if (s.emp_type === 'fulltime') {
    if (dow === 0) return null
    if (dow === 6) return (s.id + d) % 3 === 0 ? al[seed % al.length] : null
    const weekNum = Math.floor((d - 1) / 7)
    const offDow  = ((s.id * 2 + weekNum * 3) % 5) + 1
    if (dow === offDow) return 'off'
    return al[seed % al.length]
  }
  if (s.emp_type === 'parttime') {
    if (dow === 0 || dow === 6) return null
    return seed % 5 < 3 ? al[seed % al.length] : null
  }
  // shorttime
  if (dow === 0 || dow === 6) return null
  return seed % 5 < 4 ? al[seed % al.length] : null
}

function pickPref(s, d, y, m) {
  const dow  = getDow(y, m, d)
  if (dow === 0 || dow === 6) return null
  const seed = (s.id * 11 + d * 5) % 13
  const al   = s.allowed_shifts
  if (s.emp_type === 'fulltime') {
    if (seed % 6 === 0) return 'off'
    return al[seed % al.length]
  }
  if (s.emp_type === 'parttime') return seed % 4 < 2 ? al[seed % al.length] : null
  return seed % 5 < 4 ? al[seed % al.length] : null
}

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

/* ── メイン処理 ── */
async function seed() {
  console.log('=== Supabase デモデータ投入開始 ===\n')

  /* 1. 既存データを削除（再実行対応） */
  console.log('既存データを削除中...')
  await supabase.from('mod_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('pref_data').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('collections').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('shift_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('locked_months').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('min_staff').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('shift_types').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('roles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('staff_members').delete().gt('id', 0)
  await supabase.from('facilities').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('  ✓ 削除完了\n')

  /* 2. 施設を作成 */
  console.log('施設を作成中...')
  const { data: facility, error: facErr } = await supabase
    .from('facilities')
    .insert({ name: 'デモクリニック' })
    .select()
    .single()
  if (facErr) { console.error('施設作成エラー:', facErr); process.exit(1) }
  const fid = facility.id
  console.log(`  ✓ 施設ID: ${fid}\n`)

  /* 3. 職種を作成 */
  console.log('職種を作成中...')
  const { error: roleErr } = await supabase.from('roles').insert(
    ROLES_DEF.map(r => ({ ...r, facility_id: fid }))
  )
  if (roleErr) { console.error('職種作成エラー:', roleErr); process.exit(1) }
  console.log(`  ✓ ${ROLES_DEF.length}件\n`)

  /* 4. シフト種別を作成 */
  console.log('シフト種別を作成中...')
  const { error: stErr } = await supabase.from('shift_types').insert(
    SHIFT_TYPES_DEF.map(s => ({ ...s, facility_id: fid }))
  )
  if (stErr) { console.error('シフト種別作成エラー:', stErr); process.exit(1) }
  console.log(`  ✓ ${SHIFT_TYPES_DEF.length}件\n`)

  /* 5. 最低人員を作成 */
  console.log('最低人員を作成中...')
  const { error: msErr } = await supabase.from('min_staff').insert(
    MIN_STAFF_DEF.map(m => ({ ...m, facility_id: fid }))
  )
  if (msErr) { console.error('最低人員作成エラー:', msErr); process.exit(1) }
  console.log(`  ✓ ${MIN_STAFF_DEF.length}件\n`)

  /* 6. スタッフを作成 */
  console.log('スタッフを作成中...')
  const { error: stfErr } = await supabase.from('staff_members').insert(
    STAFF_DEF.map(s => ({ ...s, facility_id: fid, pin: '0000' }))
  )
  if (stfErr) { console.error('スタッフ作成エラー:', stfErr); process.exit(1) }
  console.log(`  ✓ ${STAFF_DEF.length}件\n`)

  /* 7. 今月シフトを作成 */
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth()
  const dim = getDim(y, m)

  console.log(`今月(${y}年${m+1}月)のシフトを作成中...`)
  const assignments = []
  for (const s of STAFF_DEF) {
    for (let d = 1; d <= dim; d++) {
      const v = pickShift(s, d, y, m)
      if (v) {
        assignments.push({
          facility_id: fid,
          staff_id: s.id,
          date: toDateStr(y, m, d),
          shift_type: v,
        })
      }
    }
  }
  // 100件ずつ分割してinsert
  for (let i = 0; i < assignments.length; i += 100) {
    const chunk = assignments.slice(i, i + 100)
    const { error: aErr } = await supabase.from('shift_assignments').insert(chunk)
    if (aErr) { console.error('シフト作成エラー:', aErr); process.exit(1) }
  }
  console.log(`  ✓ ${assignments.length}件\n`)

  /* 8. 来月の希望収集を作成 */
  const nm  = m === 11 ? 0 : m + 1
  const ny  = m === 11 ? y + 1 : y
  const ndim = getDim(ny, nm)
  const dl = new Date(y, m + 1, -4).toISOString().slice(0, 10)

  console.log(`来月(${ny}年${nm+1}月)の希望収集を作成中...`)
  const { data: collection, error: colErr } = await supabase
    .from('collections')
    .insert({
      facility_id: fid,
      target_year: ny,
      target_month: nm,
      status: 'collecting',
      deadline: dl,
    })
    .select()
    .single()
  if (colErr) { console.error('希望収集作成エラー:', colErr); process.exit(1) }
  const colId = collection.id
  console.log(`  ✓ 締切: ${dl}\n`)

  /* 9. 来月の希望データを作成（14名が提出済み） */
  console.log('希望データを作成中...')
  const submittedIds = new Set([1,3,4,5,7,9,11,12,14,15,16,18,19,22])
  const prefRows = []
  for (const s of STAFF_DEF.filter(s => submittedIds.has(s.id))) {
    for (let d = 1; d <= ndim; d++) {
      const v = pickPref(s, d, ny, nm)
      if (v) {
        prefRows.push({
          facility_id: fid,
          staff_id: s.id,
          collection_id: colId,
          date: toDateStr(ny, nm, d),
          pref1: v,
          pref2: null,
        })
      }
    }
  }
  for (let i = 0; i < prefRows.length; i += 100) {
    const chunk = prefRows.slice(i, i + 100)
    const { error: pErr } = await supabase.from('pref_data').insert(chunk)
    if (pErr) { console.error('希望データ作成エラー:', pErr); process.exit(1) }
  }
  console.log(`  ✓ ${prefRows.length}件（${submittedIds.size}名分）\n`)

  /* 10. 修正リクエストを作成（1件） */
  console.log('修正リクエストを作成中...')
  const { error: mrErr } = await supabase.from('mod_requests').insert({
    facility_id: fid,
    staff_id: 5,
    collection_id: colId,
    day: Math.min(15, ndim),
    new_pref1: 'off',
    new_pref2: null,
    reason: '子供の学校行事のため',
    status: 'pending',
  })
  if (mrErr) { console.error('修正リクエスト作成エラー:', mrErr); process.exit(1) }
  console.log('  ✓ 1件\n')

  console.log('=== 投入完了！===')
  console.log(`施設ID（.envに保存してください）:\nVITE_FACILITY_ID=${fid}`)
}

seed().catch(console.error)
