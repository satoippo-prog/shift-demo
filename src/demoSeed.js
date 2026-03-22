/* ─── デモ初期データ生成 ─── */
const DEMO_STAFF = [
  { id:1,  name:"田中 一郎",   role:"doctor",    empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:2,  name:"佐藤 美咲",   role:"doctor",    empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:3,  name:"鈴木 健太",   role:"doctor",    empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:4,  name:"山田 花子",   role:"nurse",     empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:5,  name:"伊藤 真理",   role:"nurse",     empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:6,  name:"渡辺 由美",   role:"nurse",     empType:"shorttime", allowedShifts:["morning","short"] },
  { id:7,  name:"中村 愛",     role:"nurse",     empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:8,  name:"小林 直子",   role:"nurse",     empType:"shorttime", allowedShifts:["morning","short"] },
  { id:9,  name:"加藤 恵",     role:"nurse",     empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:10, name:"吉田 裕子",   role:"nurse",     empType:"parttime",  allowedShifts:["morning","short","day"] },
  { id:11, name:"松本 さくら", role:"nurse",     empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:12, name:"高橋 幸子",   role:"reception", empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:13, name:"林 美穂",     role:"reception", empType:"parttime",  allowedShifts:["morning","short"] },
  { id:14, name:"清水 陽子",   role:"reception", empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:15, name:"井上 真由美", role:"reception", empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:16, name:"木村 太郎",   role:"tech",      empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:17, name:"斎藤 浩",     role:"tech",      empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:18, name:"前田 大輔",   role:"pt",        empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:19, name:"藤田 健",     role:"pt",        empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:20, name:"岡田 美和",   role:"assistant", empType:"fulltime",  allowedShifts:["early","day","late"] },
  { id:21, name:"石井 智子",   role:"assistant", empType:"parttime",  allowedShifts:["morning","short","day"] },
  { id:22, name:"長谷川 翔",   role:"assistant", empType:"fulltime",  allowedShifts:["early","day","late"] },
];

function getDow(y, m, d) { return new Date(y, m, d).getDay(); }
function getDim(y, m)    { return new Date(y, m + 1, 0).getDate(); }

/* 個人・日付から決定論的にシフトを決める */
function pickShift(s, d, y, m) {
  const dow = getDow(y, m, d);
  const isSun = dow === 0;
  const isSat = dow === 6;
  const seed  = (s.id * 13 + d * 7) % 11;
  const al    = s.allowedShifts;

  if (s.empType === 'fulltime') {
    if (isSun) return 'off';
    if (isSat) return (s.id + d) % 3 === 0 ? al[seed % al.length] : 'off';
    // 週1回の平日休み
    const weekNum = Math.floor((d - 1) / 7);
    const offDow  = ((s.id * 2 + weekNum * 3) % 5) + 1;
    if (dow === offDow) return 'off';
    return al[seed % al.length];
  }

  if (s.empType === 'parttime') {
    if (isSun || isSat) return null;
    return seed % 5 < 3 ? al[seed % al.length] : null; // 週3日程度
  }

  // shorttime
  if (isSun || isSat) return null;
  return seed % 5 < 4 ? al[seed % al.length] : null; // 週4日程度
}

/* 希望データ生成（pickShift と異なるシードで少し変化を持たせる） */
function pickPref(s, d, y, m) {
  const dow  = getDow(y, m, d);
  if (dow === 0 || dow === 6) return null;
  const seed = (s.id * 11 + d * 5) % 13;
  const al   = s.allowedShifts;

  if (s.empType === 'fulltime') {
    if (seed % 6 === 0) return 'off';
    return al[seed % al.length];
  }
  if (s.empType === 'parttime') return seed % 4 < 2 ? al[seed % al.length] : null;
  return seed % 5 < 4 ? al[seed % al.length] : null;
}

export function seedDemoStorage() {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  /* ── 今月シフト ── */
  const dim    = getDim(year, month);
  const shifts = {};
  DEMO_STAFF.forEach(s => {
    for (let d = 1; d <= dim; d++) {
      const v = pickShift(s, d, year, month);
      if (v) shifts[`${s.id}-${year}-${month}-${d}`] = v;
    }
  });

  /* ── 来月の希望収集 ── */
  const nm  = month === 11 ? 0 : month + 1;
  const ny  = month === 11 ? year + 1 : year;
  const ndim = getDim(ny, nm);

  // 締切: 今月末の5日前
  const dl = new Date(year, month + 1, -4).toISOString().slice(0, 10);

  const collections = {
    [`${ny}-${nm}`]: { status:'collecting', targetYear:ny, targetMonth:nm, deadline:dl, startedAt:new Date().toISOString() }
  };

  /* ── 来月の希望データ（14名が提出済み） ── */
  const submittedIds = new Set([1,3,4,5,7,9,11,12,14,15,16,18,19,22]);
  const prefData = {};
  DEMO_STAFF.filter(s => submittedIds.has(s.id)).forEach(s => {
    for (let d = 1; d <= ndim; d++) {
      const v = pickPref(s, d, ny, nm);
      if (v) prefData[`${s.id}-${ny}-${nm}-${d}`] = { pref1:v, pref2:null };
    }
  });

  /* ── 修正リクエスト1件 ── */
  const modRequests = [{
    staffId:5, targetYear:ny, targetMonth:nm, day:Math.min(15, ndim),
    newPref1:'off', newPref2:null, reason:'子供の学校行事のため', status:'pending'
  }];

  /* ── localStorage保存 ── */
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  save('shift_demo_shifts',      shifts);
  save('shift_demo_collections', collections);
  save('shift_demo_prefData',    prefData);
  save('shift_demo_modRequests', modRequests);

  // カスタム設定はデフォルトに戻す
  ['staff','shiftTypes','minStaff','roles','lockedMonths'].forEach(k => {
    localStorage.removeItem(`shift_demo_${k}`);
  });
  // スタッフ個別の提出状態をクリア
  Object.keys(localStorage)
    .filter(k => k.startsWith('shift_demo_prefs_') || k.startsWith('shift_demo_submitted_'))
    .forEach(k => localStorage.removeItem(k));
}
