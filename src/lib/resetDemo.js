/**
 * ブラウザから呼び出せるデモデータリセット関数
 * scripts/seedSupabase.js と同じアルゴリズムで、既存 facility_id を維持したまま再投入
 */
import { supabase } from './supabase'

const FID = import.meta.env.VITE_FACILITY_ID

/* ── マスターデータ ── */
const ROLES_DEF = [
  { key: 'doctor',    label: '医師',       color: '#0F766E', bg: '#CCFBF1' },
  { key: 'nurse',     label: '看護師',     color: '#1D4ED8', bg: '#DBEAFE' },
  { key: 'reception', label: '受付',       color: '#7E22CE', bg: '#F3E8FF' },
  { key: 'tech',      label: '検査技師',   color: '#C2410C', bg: '#FFF7ED' },
  { key: 'pt',        label: '理学療法士', color: '#15803D', bg: '#DCFCE7' },
  { key: 'assistant', label: '看護助手',   color: '#475569', bg: '#F1F5F9' },
]

const SHIFT_TYPES_DEF = [
  { key: 'early',   label: '早',   name: '早番',  start_hour: 7,  end_hour: 16, color: '#B45309', bg: '#FEF3C7', border_color: '#F59E0B' },
  { key: 'day',     label: '日',   name: '日勤',  start_hour: 9,  end_hour: 18, color: '#1D4ED8', bg: '#DBEAFE', border_color: '#60A5FA' },
  { key: 'late',    label: '遅',   name: '遅番',  start_hour: 11, end_hour: 20, color: '#6D28D9', bg: '#EDE9FE', border_color: '#A78BFA' },
  { key: 'morning', label: '午前', name: '午前',  start_hour: 9,  end_hour: 13, color: '#0F766E', bg: '#CCFBF1', border_color: '#5DCAA5' },
  { key: 'short',   label: '短',   name: '時短',  start_hour: 9,  end_hour: 15, color: '#0369A1', bg: '#E0F2FE', border_color: '#7DD3FC' },
  { key: 'off',     label: '休',   name: '休日',  start_hour: 0,  end_hour: 0,  color: '#DC2626', bg: '#FEE2E2', border_color: '#F87171' },
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

/* ── シフト生成ロジック ── */
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

async function insertChunks(table, rows) {
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from(table).insert(rows.slice(i, i + 100))
    if (error) throw new Error(`${table} insert error: ${error.message}`)
  }
}

/** デモデータを全削除→再投入。既存の facility_id は維持。 */
export async function resetDemoData() {
  // 1. この施設のデータをすべて削除（facility_idで絞り込み）
  await supabase.from('mod_requests').delete().eq('facility_id', FID)
  await supabase.from('pref_data').delete().eq('facility_id', FID)
  await supabase.from('collections').delete().eq('facility_id', FID)
  await supabase.from('shift_assignments').delete().eq('facility_id', FID)
  await supabase.from('locked_months').delete().eq('facility_id', FID)
  await supabase.from('min_staff').delete().eq('facility_id', FID)
  await supabase.from('shift_types').delete().eq('facility_id', FID)
  await supabase.from('roles').delete().eq('facility_id', FID)
  await supabase.from('staff_members').delete().eq('facility_id', FID)

  // 2. マスターデータを再投入
  await supabase.from('roles').insert(ROLES_DEF.map(r => ({ ...r, facility_id: FID })))
  await supabase.from('shift_types').insert(SHIFT_TYPES_DEF.map(s => ({ ...s, facility_id: FID })))
  await supabase.from('min_staff').insert(MIN_STAFF_DEF.map(m => ({ ...m, facility_id: FID })))
  await supabase.from('staff_members').insert(STAFF_DEF.map(s => ({ ...s, facility_id: FID, pin: '0000' })))

  // 3. 今月のシフトを生成
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth()
  const assignments = []
  for (const s of STAFF_DEF) {
    for (let d = 1; d <= getDim(y, m); d++) {
      const v = pickShift(s, d, y, m)
      if (v) assignments.push({ facility_id: FID, staff_id: s.id, date: toDateStr(y, m, d), shift_type: v })
    }
  }
  await insertChunks('shift_assignments', assignments)

  // 4. 来月の希望収集を作成
  const nm  = m === 11 ? 0 : m + 1
  const ny  = m === 11 ? y + 1 : y
  const ndim = getDim(ny, nm)
  const dl  = new Date(y, m + 1, -4).toISOString().slice(0, 10)

  const { data: collection, error: colErr } = await supabase
    .from('collections')
    .insert({ facility_id: FID, target_year: ny, target_month: nm, status: 'collecting', deadline: dl })
    .select()
    .single()
  if (colErr) throw new Error(`collection error: ${colErr.message}`)

  // 5. 来月の希望データ（14名分）
  const submittedIds = new Set([1,3,4,5,7,9,11,12,14,15,16,18,19,22])
  const prefRows = []
  for (const s of STAFF_DEF.filter(s => submittedIds.has(s.id))) {
    for (let d = 1; d <= ndim; d++) {
      const v = pickPref(s, d, ny, nm)
      if (v) prefRows.push({ facility_id: FID, staff_id: s.id, collection_id: collection.id, date: toDateStr(ny, nm, d), pref1: v, pref2: null })
    }
  }
  await insertChunks('pref_data', prefRows)

  // 6. 修正リクエスト（1件）
  await supabase.from('mod_requests').insert({
    facility_id: FID, staff_id: 5, collection_id: collection.id,
    day: Math.min(15, ndim), new_pref1: 'off', new_pref2: null,
    reason: '子供の学校行事のため', status: 'pending',
  })
}
