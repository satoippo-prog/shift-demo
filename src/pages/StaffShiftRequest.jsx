import React, { useState, useMemo, useEffect } from "react";

const SHIFT_TYPES = {
  early: { label: "早", name: "早番希望", color: "#B45309", bg: "#FEF3C7", border: "#F59E0B" },
  day: { label: "日", name: "日勤希望", color: "#1D4ED8", bg: "#DBEAFE", border: "#60A5FA" },
  late: { label: "遅", name: "遅番希望", color: "#6D28D9", bg: "#EDE9FE", border: "#A78BFA" },
  morning: { label: "午前", name: "午前希望", color: "#0F766E", bg: "#CCFBF1", border: "#5DCAA5" },
  short: { label: "短", name: "時短希望", color: "#0369A1", bg: "#E0F2FE", border: "#7DD3FC" },
  off: { label: "休", name: "休み希望", color: "#DC2626", bg: "#FEE2E2", border: "#F87171" },
  ng: { label: "NG", name: "出勤不可", color: "#FFF", bg: "#475569", border: "#334155" },
};
const WORK_SHIFTS = ["early","day","late","morning","short"];

const ROLES = {
  doctor:{label:"医師",color:"#0F766E",bg:"#CCFBF1"},nurse:{label:"看護師",color:"#1D4ED8",bg:"#DBEAFE"},
  reception:{label:"受付",color:"#7E22CE",bg:"#F3E8FF"},tech:{label:"検査技師",color:"#C2410C",bg:"#FFF7ED"},
  pt:{label:"理学療法士",color:"#15803D",bg:"#DCFCE7"},assistant:{label:"看護助手",color:"#475569",bg:"#F1F5F9"},
};
const STAFF = [
  {id:1,name:"田中 一郎",role:"doctor",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:2,name:"佐藤 美咲",role:"doctor",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:3,name:"鈴木 健太",role:"doctor",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:4,name:"山田 花子",role:"nurse",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:5,name:"伊藤 真理",role:"nurse",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:6,name:"渡辺 由美",role:"nurse",empType:"shorttime",allowedShifts:["morning","short"]},
  {id:7,name:"中村 愛",role:"nurse",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:8,name:"小林 直子",role:"nurse",empType:"shorttime",allowedShifts:["morning","short"]},
  {id:9,name:"加藤 恵",role:"nurse",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:10,name:"吉田 裕子",role:"nurse",empType:"parttime",allowedShifts:["morning","short","day"]},
  {id:11,name:"松本 さくら",role:"nurse",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:12,name:"高橋 幸子",role:"reception",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:13,name:"林 美穂",role:"reception",empType:"parttime",allowedShifts:["morning","short"]},
  {id:14,name:"清水 陽子",role:"reception",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:15,name:"井上 真由美",role:"reception",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:16,name:"木村 太郎",role:"tech",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:17,name:"斎藤 浩",role:"tech",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:18,name:"前田 大輔",role:"pt",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:19,name:"藤田 健",role:"pt",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:20,name:"岡田 美和",role:"assistant",empType:"fulltime",allowedShifts:["early","day","late"]},
  {id:21,name:"石井 智子",role:"assistant",empType:"parttime",allowedShifts:["morning","short","day"]},
  {id:22,name:"長谷川 翔",role:"assistant",empType:"fulltime",allowedShifts:["early","day","late"]},
];

const DOW=["日","月","火","水","木","金","土"];
const daysIn=(y,m)=>new Date(y,m+1,0).getDate();
const dowN=(y,m,d)=>new Date(y,m,d).getDay();

const PB=({type,size="md"})=>{if(!type||!SHIFT_TYPES[type])return null;const st=SHIFT_TYPES[type];const sz=size==="sm"?{width:20,height:16,fontSize:9,borderRadius:3}:size==="lg"?{width:36,height:30,fontSize:14,borderRadius:6}:{width:26,height:20,fontSize:10,borderRadius:4};return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:600,color:st.color,background:st.bg,border:`1.5px solid ${st.border}`,letterSpacing:-0.5,...sz}}>{st.label}</span>;};

/* Demo: simulated collection status */
const DEMO_COLLECTIONS = [
  { targetYear: 2026, targetMonth: 3, status: "collecting", deadline: "2026-03-20", label: "4月分" },
  { targetYear: 2026, targetMonth: 4, status: "closed", deadline: "2026-03-25", label: "5月分" },
];

/* ─── Auth ─── */
function TokenAuth({onAuth}){
  const[staffId,setStaffId]=useState("");const[pw,setPw]=useState("");const[error,setError]=useState("");
  const handleLogin=()=>{const id=parseInt(staffId,10);const found=STAFF.find(s=>s.id===id);if(!found){setError("該当するスタッフIDが見つかりません");return;}if(pw!=="0000"&&pw!==String(id).padStart(4,"0")){setError("パスワードが正しくありません");return;}setError("");onAuth(found);};
  const ready=staffId.trim()&&pw.trim();
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"#F8FAFC"}}>
      <div style={{background:"#FFF",borderRadius:16,padding:28,width:"100%",maxWidth:360,border:"1px solid #E2E8F0"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:56,height:56,borderRadius:16,background:"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24}}>📋</div>
          <div style={{fontSize:18,fontWeight:700,color:"#0F172A"}}>シフト希望提出</div>
          <div style={{fontSize:13,color:"#64748B",marginTop:4}}>クリニック 勤務シフト管理システム</div>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"#475569",marginBottom:6}}>従業員ID</div>
          <input type="text" inputMode="numeric" value={staffId} onChange={e=>{setStaffId(e.target.value);setError("");}} placeholder="例: 8" autoFocus style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${error&&!pw?"#EF4444":"#CBD5E1"}`,fontSize:15,background:"#FFF",color:"#0F172A",boxSizing:"border-box",letterSpacing:1}}/>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:"#475569",marginBottom:6}}>パスワード</div>
          <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setError("");}} onKeyDown={e=>{if(e.key==="Enter"&&ready)handleLogin();}} placeholder="パスワードを入力" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${error&&pw?"#EF4444":"#CBD5E1"}`,fontSize:15,background:"#FFF",color:"#0F172A",boxSizing:"border-box",letterSpacing:2}}/>
        </div>
        {error&&<div style={{fontSize:11,color:"#EF4444",marginBottom:12}}>{error}</div>}
        <div style={{fontSize:10,color:"#94A3B8",marginBottom:14,lineHeight:1.6}}>デモ用: ID 1〜22 / PW 0000</div>
        <button onClick={handleLogin} disabled={!ready} style={{width:"100%",padding:"12px",borderRadius:8,border:"none",background:ready?"#1D4ED8":"#CBD5E1",color:"#FFF",fontSize:14,fontWeight:600,cursor:ready?"pointer":"default",opacity:ready?1:0.6}}>ログイン</button>
      </div>
    </div>
  );
}

/* ─── Day Picker (2-step) ─── */
function DayPicker({day,month,year,pref,onSave,onCancel,allowedShifts}){
  const[step,setStep]=useState(pref?.pref1?"done":1);
  const[p1,setP1]=useState(pref?.pref1||null);
  const[p2,setP2]=useState(pref?.pref2||null);
  const availableShifts=allowedShifts||WORK_SHIFTS;
  const allOptions=[...availableShifts.map(k=>({k,st:SHIFT_TYPES[k]})),{k:"off",st:SHIFT_TYPES.off},{k:"ng",st:SHIFT_TYPES.ng}].filter(x=>x.st);

  const selectP1=(type)=>{setP1(type);setP2(null);if(type==="off"||type==="ng"){onSave({pref1:type,pref2:null});return;}setStep(2);};
  const selectP2=(type)=>{setP2(type);onSave({pref1:p1,pref2:type});};
  const skipP2=()=>{onSave({pref1:p1,pref2:null});};
  const clearAll=()=>{onSave(null);};
  const dowStr=DOW[dowN(year,month-1,day)];
  const p2Options=availableShifts.filter(k=>k!==p1);

  return(
    <div style={{margin:"0 12px 8px",padding:"14px",background:"#F8FAFC",borderRadius:10,border:"1px solid #E2E8F0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:12}}>
        <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,background:step===1?"#1D4ED8":p1?"#16A34A":"#E2E8F0",color:step===1||p1?"#FFF":"#94A3B8"}}>{p1?"✓":"1"}</div>
        <div style={{width:20,height:1.5,background:p1?"#16A34A":"#E2E8F0"}}/>
        <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,background:step===2?"#1D4ED8":"#E2E8F0",color:step===2?"#FFF":"#94A3B8"}}>2</div>
      </div>
      <div style={{fontSize:14,fontWeight:600,color:"#0F172A",marginBottom:10,textAlign:"center"}}>{month}月{day}日（{dowStr}）</div>

      {(step===1||step==="done")&&!p1&&<React.Fragment>
        <div style={{fontSize:11,fontWeight:600,color:"#475569",marginBottom:8}}>第1希望を選択</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {allOptions.map(({k,st})=><button key={k} onClick={()=>selectP1(k)} style={{padding:"10px 4px",borderRadius:8,border:"1.5px solid #E2E8F0",background:"#FFF",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:st.color}}>{st.label}</div><div style={{fontSize:10,color:"#64748B",marginTop:2}}>{st.name}</div></button>)}
          <button onClick={clearAll} style={{padding:"10px 4px",borderRadius:8,border:"1.5px solid #E2E8F0",background:"#FFF",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"#94A3B8"}}>−</div><div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>クリア</div></button>
        </div>
      </React.Fragment>}

      {step==="done"&&p1&&<React.Fragment>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:10,background:SHIFT_TYPES[p1]?.bg||"#F1F5F9",borderRadius:8,marginBottom:8}}>
          <PB type={p1} size="lg"/>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:SHIFT_TYPES[p1]?.color}}>{SHIFT_TYPES[p1]?.name}</div>
            {p2&&<div style={{fontSize:11,color:"#64748B"}}>第2: {SHIFT_TYPES[p2]?.name}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>{setP1(null);setP2(null);setStep(1);}} style={{flex:1,padding:"8px",borderRadius:6,border:"1px solid #E2E8F0",background:"#FFF",cursor:"pointer",fontSize:11,fontWeight:600,color:"#475569"}}>変更</button>
          <button onClick={clearAll} style={{flex:1,padding:"8px",borderRadius:6,border:"1px solid #FECACA",background:"#FFF",cursor:"pointer",fontSize:11,fontWeight:600,color:"#DC2626"}}>クリア</button>
          <button onClick={onCancel} style={{flex:1,padding:"8px",borderRadius:6,border:"1px solid #E2E8F0",background:"#FFF",cursor:"pointer",fontSize:11,fontWeight:600,color:"#475569"}}>閉じる</button>
        </div>
      </React.Fragment>}

      {step===2&&p1&&<React.Fragment>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
          <span style={{fontSize:11,color:"#64748B"}}>第1希望:</span><PB type={p1}/>
        </div>
        <div style={{fontSize:11,fontWeight:600,color:"#475569",marginBottom:8}}>第2希望（任意）</div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(p2Options.length,3)},1fr)`,gap:6,marginBottom:8}}>
          {p2Options.map(k=>{const st=SHIFT_TYPES[k];return <button key={k} onClick={()=>selectP2(k)} style={{padding:"10px 4px",borderRadius:8,border:"1.5px solid #E2E8F0",background:"#FFF",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:st.color}}>{st.label}</div><div style={{fontSize:10,color:"#64748B",marginTop:2}}>{st.name}</div></button>;})}
        </div>
        <button onClick={skipP2} style={{width:"100%",padding:"8px",borderRadius:6,border:"1px solid #E2E8F0",background:"#FFF",cursor:"pointer",fontSize:11,fontWeight:500,color:"#94A3B8"}}>第2希望なし</button>
      </React.Fragment>}
    </div>
  );
}

/* ─── Modification Request Form ─── */
function ModRequestForm({user,collection,onSubmit,onCancel}){
  const[day,setDay]=useState("");const[newPref,setNewPref]=useState("");const[reason,setReason]=useState("");
  const allowed=user.allowedShifts||WORK_SHIFTS;
  const allOptions=[...allowed,..."off","ng".split(",")];
  return(
    <div style={{margin:"0 12px",padding:"14px",background:"#FFF7ED",borderRadius:10,border:"1.5px solid #FED7AA"}}>
      <div style={{fontSize:14,fontWeight:600,color:"#9A3412",marginBottom:10}}>修正リクエスト</div>
      <div style={{marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:600,color:"#475569",marginBottom:4}}>変更したい日</div>
        <input type="number" value={day} onChange={e=>setDay(e.target.value)} min={1} max={daysIn(collection.targetYear,collection.targetMonth)} placeholder="例: 15" style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1.5px solid #CBD5E1",fontSize:13,boxSizing:"border-box"}}/>
      </div>
      <div style={{marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:600,color:"#475569",marginBottom:4}}>変更後の希望</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {[...allowed.map(k=>({k,st:SHIFT_TYPES[k]})),{k:"off",st:SHIFT_TYPES.off},{k:"ng",st:SHIFT_TYPES.ng}].filter(x=>x.st).map(({k,st})=>(
            <button key={k} onClick={()=>setNewPref(k)} style={{padding:"6px 10px",borderRadius:6,border:newPref===k?`2px solid ${st.border}`:"1px solid #E2E8F0",background:newPref===k?st.bg:"#FFF",cursor:"pointer",fontSize:11,fontWeight:600,color:newPref===k?st.color:"#94A3B8"}}>{st.label} {st.name}</button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:600,color:"#475569",marginBottom:4}}>変更理由</div>
        <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="例: 子供の学校行事のため" rows={2} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1.5px solid #CBD5E1",fontSize:12,boxSizing:"border-box",resize:"vertical"}}/>
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={onCancel} style={{flex:1,padding:"10px",borderRadius:8,border:"1px solid #E2E8F0",background:"#FFF",fontSize:12,fontWeight:600,cursor:"pointer",color:"#475569"}}>キャンセル</button>
        <button onClick={()=>{if(day&&newPref&&reason.trim())onSubmit({day:+day,newPref1:newPref,reason});}} disabled={!day||!newPref||!reason.trim()} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:day&&newPref&&reason.trim()?"#B45309":"#CBD5E1",color:"#FFF",fontSize:12,fontWeight:700,cursor:day&&newPref&&reason.trim()?"pointer":"default"}}>リクエスト送信</button>
      </div>
    </div>
  );
}

/* ─── Main Screen ─── */
function SubmissionScreen({user,onLogout}){
  const lsGet=(key,def)=>{try{const v=localStorage.getItem(key);return v!=null?JSON.parse(v):def;}catch{return def;}};
  const openCollections=useMemo(()=>{
    try{
      const stored=localStorage.getItem('shift_demo_collections');
      if(stored){const obj=JSON.parse(stored);const arr=Object.values(obj).filter(c=>c.status==="collecting"||c.status==="closed");if(arr.length>0)return arr;}
    }catch{}
    return DEMO_COLLECTIONS.filter(c=>c.status==="collecting"||c.status==="closed");
  },[]);
  const[activeIdx,setActiveIdx]=useState(()=>{const ci=openCollections.findIndex(c=>c.status==="collecting");return ci>=0?ci:0;});
  const col=openCollections[activeIdx]||null;

  const targetYear=col?.targetYear||2026;
  const targetMonth=col?.targetMonth||3;
  const m0=targetMonth;
  const dim=col?daysIn(targetYear,m0):0;
  const isClosed=col?.status==="closed";

  const[prefs,setPrefs]=useState(()=>lsGet(`shift_demo_prefs_${user.id}`,{}));
  const[submitted,setSubmitted]=useState(()=>lsGet(`shift_demo_submitted_${user.id}`,{}));
  useEffect(()=>{try{localStorage.setItem(`shift_demo_prefs_${user.id}`,JSON.stringify(prefs));}catch{}},[prefs,user.id]);
  useEffect(()=>{try{localStorage.setItem(`shift_demo_submitted_${user.id}`,JSON.stringify(submitted));}catch{}},[submitted,user.id]);
  const[showConfirm,setShowConfirm]=useState(false);
  const[comment,setComment]=useState("");
  const[selectedDay,setSelectedDay]=useState(null);
  const[showModForm,setShowModForm]=useState(false);
  const[modSent,setModSent]=useState(false);

  const submKey=col?`${targetYear}-${m0}`:"";
  const isSubmitted=!!submitted[submKey];

  const firstDow=col?dowN(targetYear,m0,1):0;
  const pk=(d)=>`${targetYear}-${m0}-${d}`;
  const getPref=(d)=>prefs[pk(d)]||null;

  const savePref=(d,val)=>{
    if(isClosed||isSubmitted)return;
    const key=pk(d);
    const sharedKey=`${user.id}-${targetYear}-${targetMonth}-${d}`;
    if(!val){
      setPrefs(p=>{const n={...p};delete n[key];return n;});
      try{const pd=JSON.parse(localStorage.getItem('shift_demo_prefData')||'{}');delete pd[sharedKey];localStorage.setItem('shift_demo_prefData',JSON.stringify(pd));}catch{}
    }else{
      setPrefs(p=>({...p,[key]:val}));
      try{const pd=JSON.parse(localStorage.getItem('shift_demo_prefData')||'{}');pd[sharedKey]=val;localStorage.setItem('shift_demo_prefData',JSON.stringify(pd));}catch{}
    }
    setSelectedDay(null);
  };

  const filledDays=useMemo(()=>{if(!col)return 0;let c=0;for(let d=1;d<=dim;d++){if(prefs[pk(d)])c++;}return c;},[prefs,dim,col]);
  const progress=dim?Math.round((filledDays/dim)*100):0;

  const role=ROLES[user.role];
  const allowed=user.allowedShifts||WORK_SHIFTS;

  const handleModSubmit=(data)=>{
    const req={staffId:user.id,targetYear,targetMonth,day:data.day,newPref1:data.newPref1,newPref2:null,reason:data.reason,status:"pending"};
    try{const existing=JSON.parse(localStorage.getItem('shift_demo_modRequests')||'[]');localStorage.setItem('shift_demo_modRequests',JSON.stringify([...existing,req]));}catch{}
    setModSent(true);setShowModForm(false);
  };

  if(openCollections.length===0){
    return(
      <div style={{maxWidth:480,margin:"0 auto",background:"#FFF",minHeight:"100vh",fontFamily:"'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{textAlign:"center",padding:32}}>
          <div style={{fontSize:48,marginBottom:16,opacity:0.3}}>📋</div>
          <div style={{fontSize:16,fontWeight:600,color:"#475569"}}>現在募集中の月はありません</div>
          <div style={{fontSize:13,color:"#94A3B8",marginTop:8}}>管理者が募集を開始するとここに表示されます</div>
          <button onClick={onLogout} style={{marginTop:20,padding:"8px 20px",borderRadius:8,border:"1px solid #E2E8F0",background:"#F8FAFC",cursor:"pointer",fontSize:12,fontWeight:600,color:"#475569"}}>ログアウト</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{maxWidth:480,margin:"0 auto",background:"#FFF",minHeight:"100vh",fontFamily:"'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif"}}>
      {/* Header */}
      <div style={{padding:"14px 16px",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:"#0F172A"}}>シフト希望提出</div>
          <div style={{fontSize:11,color:"#64748B"}}>{user.name} ({role.label}){user.empType!=="fulltime"?` ・ ${user.empType==="parttime"?"パート":"時短"}`:""}</div>
        </div>
        <button onClick={onLogout} style={{fontSize:10,padding:"4px 8px",borderRadius:4,border:"1px solid #E2E8F0",background:"#F8FAFC",cursor:"pointer",color:"#64748B"}}>ログアウト</button>
      </div>

      {/* Month selector (if 2 months open) */}
      {openCollections.length>1&&(
        <div style={{padding:"10px 16px 0",display:"flex",gap:8}}>
          {openCollections.map((c,i)=>{
            const sel=i===activeIdx;
            const label=`${c.targetMonth+1}月分`;
            const isOpen=c.status==="collecting";
            return(
              <button key={i} onClick={()=>{setActiveIdx(i);setSelectedDay(null);}} style={{flex:1,padding:"10px 8px",borderRadius:8,border:sel?"2px solid #1D4ED8":"1.5px solid #E2E8F0",background:sel?(isOpen?"#DBEAFE":"#FEF3C7"):"#FFF",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:600,color:sel?(isOpen?"#1D4ED8":"#B45309"):"#94A3B8"}}>{label}</div>
                <div style={{fontSize:10,color:sel?(isOpen?"#1E40AF":"#92400E"):"#94A3B8",marginTop:2}}>
                  {isOpen?"受付中":"締切済み"}
                  {submitted[`${c.targetYear}-${c.targetMonth}`]?" ✓ 提出済":""}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Target month header */}
      {col&&(
        <div style={{padding:"10px 16px",textAlign:"center"}}>
          <div style={{fontSize:20,fontWeight:700,color:isClosed?"#B45309":"#1D4ED8"}}>{targetYear}年{targetMonth+1}月分</div>
          <div style={{fontSize:12,color:isClosed?"#92400E":"#1E40AF",marginTop:2}}>
            {isClosed?"締切済み":"シフト希望 受付中"}
            {col.deadline&&!isClosed&&<span style={{color:"#64748B"}}> ・ 締切: {col.deadline.slice(5)}</span>}
          </div>
        </div>
      )}

      {/* Submitted status */}
      {isSubmitted&&!isClosed&&(
        <div style={{margin:"0 16px 8px",padding:"10px 14px",background:"#F0FDF4",border:"1.5px solid #BBF7D0",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontSize:13,fontWeight:700,color:"#166534"}}>✓ 提出済み</div></div>
          <button onClick={()=>setSubmitted(p=>({...p,[submKey]:false}))} style={{fontSize:11,padding:"5px 10px",borderRadius:6,border:"1px solid #BBF7D0",background:"#FFF",cursor:"pointer",color:"#15803D",fontWeight:600}}>修正する</button>
        </div>
      )}

      {/* Closed + modification request */}
      {isClosed&&(
        <div style={{margin:"0 16px 8px"}}>
          {isSubmitted&&!modSent&&<div style={{padding:"10px 14px",background:"#F0FDF4",border:"1.5px solid #BBF7D0",borderRadius:8,marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:700,color:"#166534"}}>✓ 提出済み</div>
          </div>}
          {modSent?
            <div style={{padding:"10px 14px",background:"#EFF6FF",border:"1.5px solid #BFDBFE",borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:"#1D4ED8"}}>修正リクエストを送信しました</div>
              <div style={{fontSize:11,color:"#475569",marginTop:2}}>管理者の承認をお待ちください</div>
            </div>
          : <div style={{padding:"10px 14px",background:"#FFF7ED",border:"1.5px solid #FED7AA",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:12,color:"#9A3412"}}>締切後の変更は管理者の承認が必要です</div>
              <button onClick={()=>setShowModForm(true)} style={{fontSize:11,padding:"5px 10px",borderRadius:6,border:"1px solid #FED7AA",background:"#FFF",cursor:"pointer",color:"#B45309",fontWeight:600}}>修正を依頼</button>
            </div>
          }
        </div>
      )}

      {showModForm&&<ModRequestForm user={user} collection={col} onSubmit={handleModSubmit} onCancel={()=>setShowModForm(false)}/>}

      {/* Progress */}
      {!isSubmitted&&!isClosed&&dim>0&&(
        <div style={{padding:"8px 16px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748B",marginBottom:4}}>
            <span>入力進捗</span><span>{filledDays}/{dim}日（{progress}%）</span>
          </div>
          <div style={{height:6,background:"#E2E8F0",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${progress}%`,background:progress===100?"#16A34A":"#3B82F6",borderRadius:3,transition:"width 0.3s"}}/>
          </div>
        </div>
      )}

      {/* Calendar */}
      {dim>0&&<div style={{padding:"8px 12px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,textAlign:"center"}}>
          {DOW.map((d,i)=><div key={d} style={{padding:"6px 0",fontSize:11,fontWeight:600,color:i===0?"#DC2626":i===6?"#EA580C":"#64748B"}}>{d}</div>)}
          {Array.from({length:firstDow},(_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:dim},(_,i)=>{
            const d=i+1;const su=dowN(targetYear,m0,d)===0,sa=dowN(targetYear,m0,d)===6;
            const pref=getPref(d);const st=pref?SHIFT_TYPES[pref.pref1]:null;
            const isSelected=selectedDay===d;
            return(
              <div key={d} onClick={()=>{if(!isClosed&&!isSubmitted)setSelectedDay(isSelected?null:d);}} style={{
                position:"relative",padding:"3px 2px",minHeight:50,borderRadius:8,
                cursor:isClosed||isSubmitted?"default":"pointer",
                background:st?st.bg:"transparent",
                border:isSelected?"2px solid #3B82F6":st?`1.5px solid ${st.border}`:"1.5px solid transparent",
                opacity:isClosed&&!isSubmitted?0.5:1,
              }}>
                <div style={{fontSize:12,fontWeight:600,color:su?"#DC2626":sa?"#EA580C":"#0F172A",marginBottom:2}}>{d}</div>
                {pref&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:1}}>
                  <PB type={pref.pref1} size="sm"/>
                  {pref.pref2&&<PB type={pref.pref2} size="sm"/>}
                </div>}
              </div>
            );
          })}
        </div>
      </div>}

      {/* Day picker */}
      {selectedDay&&!isClosed&&!isSubmitted&&<DayPicker day={selectedDay} month={targetMonth+1} year={targetYear} pref={getPref(selectedDay)} onSave={(val)=>savePref(selectedDay,val)} onCancel={()=>setSelectedDay(null)} allowedShifts={allowed}/>}

      {/* Comment */}
      {!isClosed&&<div style={{padding:"8px 16px 12px"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#475569",marginBottom:4}}>備考・連絡事項</div>
        <textarea value={comment} onChange={e=>setComment(e.target.value)} disabled={isSubmitted} placeholder="例：15日は通院のため遅番希望です" rows={2} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1.5px solid #CBD5E1",fontSize:13,resize:"vertical",boxSizing:"border-box",background:isSubmitted?"#F8FAFC":"#FFF"}}/>
      </div>}

      {/* Submit */}
      {!isSubmitted&&!isClosed&&(
        <div style={{padding:"0 16px 24px"}}>
          <button onClick={()=>setShowConfirm(true)} disabled={filledDays===0} style={{width:"100%",padding:"14px",borderRadius:10,border:"none",background:filledDays>0?"#1D4ED8":"#CBD5E1",color:"#FFF",fontSize:15,fontWeight:700,cursor:filledDays>0?"pointer":"default",opacity:filledDays>0?1:0.6}}>
            {targetMonth+1}月分の希望を提出する
          </button>
          <div style={{fontSize:11,color:"#94A3B8",textAlign:"center",marginTop:6}}>提出後も締切前であれば修正可能です</div>
        </div>
      )}

      {/* Confirm */}
      {showConfirm&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.4)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:"#FFF",borderRadius:"16px 16px 0 0",padding:24,width:"100%",maxWidth:480}}>
            <div style={{fontSize:16,fontWeight:700,color:"#0F172A",marginBottom:8}}>{targetYear}年{targetMonth+1}月分として提出しますか？</div>
            <div style={{fontSize:13,color:"#475569",marginBottom:6}}>{filledDays}日分の希望が入力されています。</div>
            {dim-filledDays>0&&<div style={{fontSize:12,color:"#94A3B8",marginBottom:12}}>未入力{dim-filledDays}日は「希望なし」として扱われます</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowConfirm(false)} style={{flex:1,padding:"12px",borderRadius:8,border:"1px solid #E2E8F0",background:"#FFF",fontSize:14,fontWeight:600,cursor:"pointer",color:"#475569"}}>戻る</button>
              <button onClick={()=>{setSubmitted(p=>({...p,[submKey]:true}));setShowConfirm(false);}} style={{flex:1,padding:"12px",borderRadius:8,border:"none",background:"#1D4ED8",color:"#FFF",fontSize:14,fontWeight:700,cursor:"pointer"}}>提出する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffShiftApp(){
  const[user,setUser]=useState(null);
  return user?<SubmissionScreen user={user} onLogout={()=>setUser(null)}/>:<TokenAuth onAuth={setUser}/>;
}
