import React, { useState, useMemo, useCallback, useEffect } from "react";

/* ─── Default Data ─── */
const DEF_SHIFTS = {
  early: { label: "早", name: "早番", start: 7, end: 16, time: "7:00-16:00", color: "#B45309", bg: "#FEF3C7", border: "#F59E0B" },
  day: { label: "日", name: "日勤", start: 9, end: 18, time: "9:00-18:00", color: "#1D4ED8", bg: "#DBEAFE", border: "#60A5FA" },
  late: { label: "遅", name: "遅番", start: 11, end: 20, time: "11:00-20:00", color: "#6D28D9", bg: "#EDE9FE", border: "#A78BFA" },
  morning: { label: "午前", name: "午前", start: 9, end: 13, time: "9:00-13:00", color: "#0F766E", bg: "#CCFBF1", border: "#5DCAA5" },
  short: { label: "短", name: "時短", start: 9, end: 15, time: "9:00-15:00", color: "#0369A1", bg: "#E0F2FE", border: "#7DD3FC" },
  off: { label: "休", name: "休日", start: 0, end: 0, time: "", color: "#DC2626", bg: "#FEE2E2", border: "#F87171" },
};
const EMP_TYPES = {
  fulltime: { label: "常勤", color: "#1D4ED8", bg: "#DBEAFE" },
  parttime: { label: "パート", color: "#0F766E", bg: "#CCFBF1" },
  shorttime: { label: "時短", color: "#7E22CE", bg: "#F3E8FF" },
};
const DEF_ROLES = {
  doctor: { label: "医師", color: "#0F766E", bg: "#CCFBF1" },
  nurse: { label: "看護師", color: "#1D4ED8", bg: "#DBEAFE" },
  reception: { label: "受付", color: "#7E22CE", bg: "#F3E8FF" },
  tech: { label: "検査技師", color: "#C2410C", bg: "#FFF7ED" },
  pt: { label: "理学療法士", color: "#15803D", bg: "#DCFCE7" },
  assistant: { label: "看護助手", color: "#475569", bg: "#F1F5F9" },
};
const ROLE_COLORS = ["#0F766E","#1D4ED8","#7E22CE","#C2410C","#15803D","#475569","#B45309","#DC2626","#0369A1"];
const ROLE_BGS = ["#CCFBF1","#DBEAFE","#F3E8FF","#FFF7ED","#DCFCE7","#F1F5F9","#FEF3C7","#FEE2E2","#E0F2FE"];
let ROLES = DEF_ROLES;
const DEF_MIN = { doctor: 1, nurse: 3, reception: 3, tech: 1, pt: 3, assistant: 2 };
const ALL_WORK=["early","day","late","morning","short"];
const INIT_STAFF = [
  { id: 1, name: "田中 一郎", role: "doctor", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 2, name: "佐藤 美咲", role: "doctor", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 3, name: "鈴木 健太", role: "doctor", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 4, name: "山田 花子", role: "nurse", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 5, name: "伊藤 真理", role: "nurse", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 6, name: "渡辺 由美", role: "nurse", empType: "shorttime", allowedShifts: ["morning","short"] },
  { id: 7, name: "中村 愛", role: "nurse", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 8, name: "小林 直子", role: "nurse", empType: "shorttime", allowedShifts: ["morning","short"] },
  { id: 9, name: "加藤 恵", role: "nurse", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 10, name: "吉田 裕子", role: "nurse", empType: "parttime", allowedShifts: ["morning","short","day"] },
  { id: 11, name: "松本 さくら", role: "nurse", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 12, name: "高橋 幸子", role: "reception", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 13, name: "林 美穂", role: "reception", empType: "parttime", allowedShifts: ["morning","short"] },
  { id: 14, name: "清水 陽子", role: "reception", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 15, name: "井上 真由美", role: "reception", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 16, name: "木村 太郎", role: "tech", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 17, name: "斎藤 浩", role: "tech", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 18, name: "前田 大輔", role: "pt", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 19, name: "藤田 健", role: "pt", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 20, name: "岡田 美和", role: "assistant", empType: "fulltime", allowedShifts: ["early","day","late"] },
  { id: 21, name: "石井 智子", role: "assistant", empType: "parttime", allowedShifts: ["morning","short","day"] },
  { id: 22, name: "長谷川 翔", role: "assistant", empType: "fulltime", allowedShifts: ["early","day","late"] },
];

const DOW = ["日","月","火","水","木","金","土"];
const daysIn = (y,m) => new Date(y,m+1,0).getDate();
const dowN = (y,m,d) => new Date(y,m,d).getDay();
const isSun = (y,m,d) => dowN(y,m,d)===0;
const isSat = (y,m,d) => dowN(y,m,d)===6;
const sk = (sid,y,m,d) => `${sid}-${y}-${m}-${d}`;

const PCSS = `@media print{@page{size:A4 landscape;margin:8mm}.no-print{display:none!important}.print-only{display:block!important}.print-table-wrap{overflow:visible!important;max-height:none!important;border:none!important}.print-table-wrap table{font-size:9px!important}.print-table-wrap th,.print-table-wrap td{padding:2px 3px!important;border:0.5px solid #ccc!important}}`;

function checkPV(sid,shifts,y,m,dim){const v=[];for(let d=1;d<=dim;d++){const s=shifts[sk(sid,y,m,d)];if(!s||s==="off")continue;let c=0;for(let i=d;i>=1;i--){const x=shifts[sk(sid,y,m,i)];if(x&&x!=="off")c++;else break;}if(c>=6)v.push({day:d,type:"consecutive",message:`${c}連勤`});if(d>1){const p=shifts[sk(sid,y,m,d-1)];if(p==="late"&&s==="early")v.push({day:d,type:"interval",message:"インターバル不足"});}}return v;}

function getDS(staff,shifts,y,m,d,minStaff){const counts={};Object.keys(ROLES).forEach(r=>{counts[r]=0;});staff.forEach(s=>{const sh=shifts[sk(s.id,y,m,d)];if(sh&&sh!=="off")counts[s.role]++;});const shortages=[];Object.entries(minStaff).forEach(([role,min])=>{if(counts[role]<min)shortages.push({role,current:counts[role],required:min,deficit:min-counts[role]});});return{counts,shortages};}

/* ─── Small Components ─── */
const RB=({role})=>{const r=ROLES[role];return <span style={{fontSize:10,fontWeight:600,padding:"1px 5px",borderRadius:4,color:r.color,background:r.bg,whiteSpace:"nowrap",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"}}>{r.label}</span>;};
const SB=({type,shiftTypes,size="md"})=>{if(!type)return null;const st=shiftTypes[type];if(!st)return null;const s=size==="sm"?{width:22,height:18,fontSize:10,borderRadius:4}:{width:28,height:24,fontSize:12,borderRadius:5};return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:600,color:st.color,background:st.bg,border:`1.5px solid ${st.border}`,letterSpacing:-0.5,WebkitPrintColorAdjust:"exact",printColorAdjust:"exact",...s}}>{st.label}</span>;};

/* ─── Settings Panel ─── */
function SettingsPanel({staff,setStaff,shiftTypes,setShiftTypes,minStaff,setMinStaff,roles,setRoles,onClose}){
  const[tab,setTab]=useState("staff");
  const[editId,setEditId]=useState(null);
  const[form,setForm]=useState({name:"",role:Object.keys(roles)[0]||"nurse"});
  const[shiftEdit,setShiftEdit]=useState(null);
  const[roleEdit,setRoleEdit]=useState(null);
  const[newRole,setNewRole]=useState({key:"",label:"",colorIdx:0});
  const nextId=Math.max(...staff.map(s=>s.id),0)+1;

  const workShiftKeys=Object.keys(shiftTypes).filter(k=>k!=="off");
  const startAdd=()=>{setForm({name:"",role:Object.keys(roles)[0]||"nurse",empType:"fulltime",allowedShifts:["early","day","late"]});setEditId("new");};
  const startEdit=(s)=>{setForm({name:s.name,role:s.role,empType:s.empType||"fulltime",allowedShifts:s.allowedShifts||workShiftKeys});setEditId(s.id);};
  const save=()=>{if(!form.name.trim())return;if(editId==="new"){setStaff(p=>[...p,{id:nextId,...form}]);}else{setStaff(p=>p.map(s=>s.id===editId?{...s,...form}:s));}setEditId(null);};
  const del=(id)=>{setStaff(p=>p.filter(s=>s.id!==id));};
  const toggleAllowed=(key)=>{setForm(p=>{const cur=p.allowedShifts||[];return{...p,allowedShifts:cur.includes(key)?cur.filter(k=>k!==key):[...cur,key]};});};
  const applyPreset=(type)=>{
    if(type==="fulltime")setForm(p=>({...p,empType:"fulltime",allowedShifts:["early","day","late"]}));
    else if(type==="parttime")setForm(p=>({...p,empType:"parttime",allowedShifts:["morning","short","day"]}));
    else if(type==="shorttime")setForm(p=>({...p,empType:"shorttime",allowedShifts:["morning","short"]}));
  };

  const workShifts=Object.entries(shiftTypes).filter(([k])=>k!=="off");
  const startShiftEdit=(k,v)=>setShiftEdit({key:k,name:v.name,label:v.label,start:v.start,end:v.end});
  const saveShift=()=>{if(!shiftEdit)return;const{key,...rest}=shiftEdit;const time=`${rest.start}:00-${rest.end}:00`;setShiftTypes(p=>({...p,[key]:{...p[key],...rest,time}}));setShiftEdit(null);};

  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.35)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#FFF",borderRadius:12,width:"100%",maxWidth:640,maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:0,border:"1px solid #E2E8F0",borderRadius:6,overflow:"hidden"}}>
            {[{k:"staff",l:"スタッフ"},{k:"role",l:"職種管理"},{k:"shift",l:"シフト枠"},{k:"min",l:"最低人員"}].map(t=>(
              <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"6px 14px",fontSize:12,fontWeight:600,border:"none",cursor:"pointer",background:tab===t.k?"#1D4ED8":"#FFF",color:tab===t.k?"#FFF":"#475569"}}>{t.l}</button>
            ))}
          </div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:6,border:"1px solid #E2E8F0",background:"#FFF",cursor:"pointer",fontSize:16,color:"#475569"}}>✕</button>
        </div>
        <div style={{padding:20,overflowY:"auto",flex:1}}>
          {tab==="staff"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <span style={{fontSize:14,fontWeight:700}}>{staff.length}名登録中</span>
              <button onClick={startAdd} style={{...btnS,background:"#1D4ED8",color:"#FFF",border:"1px solid #1D4ED8"}}>+ 追加</button>
            </div>
            {editId&&<div style={{padding:12,background:"#F8FAFC",borderRadius:8,border:"1px solid #E2E8F0",marginBottom:12}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:8}}>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="氏名" style={{padding:"6px 10px",borderRadius:6,border:"1px solid #CBD5E1",fontSize:13,flex:1,minWidth:120}}/>
                <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #CBD5E1",fontSize:13}}>
                  {Object.entries(roles).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,fontWeight:600,color:"#475569",minWidth:50}}>勤務形態</span>
                {Object.entries(EMP_TYPES).map(([k,v])=>(
                  <button key={k} onClick={()=>applyPreset(k)} style={{padding:"3px 10px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",border:form.empType===k?`1.5px solid ${v.color}`:"1px solid #E2E8F0",background:form.empType===k?v.bg:"#FFF",color:form.empType===k?v.color:"#94A3B8"}}>{v.label}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:600,color:"#475569",minWidth:50}}>割当可能</span>
                {workShiftKeys.map(k=>{const st=shiftTypes[k];if(!st)return null;const on=(form.allowedShifts||[]).includes(k);return(
                  <button key={k} onClick={()=>toggleAllowed(k)} style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",border:on?`1.5px solid ${st.border}`:"1px solid #E2E8F0",background:on?st.bg:"#FFF",color:on?st.color:"#CBD5E1"}}>{st.name}</button>
                );})}
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={save} style={{...btnS,background:"#16A34A",color:"#FFF",border:"none"}}>保存</button>
                <button onClick={()=>setEditId(null)} style={btnS}>キャンセル</button>
              </div>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {staff.map(s=>{const et=EMP_TYPES[s.empType]||EMP_TYPES.fulltime;return <div key={s.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",borderRadius:6,border:"1px solid #E2E8F0",fontSize:13}}>
                <RB role={s.role}/>
                <span style={{fontSize:9,fontWeight:600,padding:"1px 4px",borderRadius:3,color:et.color,background:et.bg}}>{et.label}</span>
                <span style={{flex:1,fontWeight:500}}>{s.name}</span>
                {s.empType!=="fulltime"&&<span style={{fontSize:9,color:"#94A3B8"}}>{(s.allowedShifts||[]).map(k=>shiftTypes[k]?.label||k).join("/")}</span>}
                <button onClick={()=>startEdit(s)} style={{...btnS,fontSize:10,padding:"2px 8px"}}>編集</button>
                <button onClick={()=>del(s.id)} style={{...btnS,fontSize:10,padding:"2px 8px",color:"#DC2626",border:"1px solid #FECACA"}}>削除</button>
              </div>})}
            </div>
          </div>}
          {tab==="shift"&&<div>
            <div style={{fontSize:12,color:"#475569",marginBottom:12}}>シフト枠の名称・時間を施設に合わせて変更できます</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {workShifts.map(([k,v])=>(
                <div key={k} style={{padding:12,borderRadius:8,border:`1.5px solid ${v.border}`,background:v.bg,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <SB type={k} shiftTypes={shiftTypes}/>
                  {shiftEdit&&shiftEdit.key===k?<React.Fragment>
                    <input value={shiftEdit.name} onChange={e=>setShiftEdit(p=>({...p,name:e.target.value}))} style={{padding:"4px 8px",borderRadius:4,border:"1px solid #CBD5E1",fontSize:12,width:80}}/>
                    <input value={shiftEdit.label} onChange={e=>setShiftEdit(p=>({...p,label:e.target.value}))} style={{padding:"4px 8px",borderRadius:4,border:"1px solid #CBD5E1",fontSize:12,width:40}} maxLength={2}/>
                    <label style={{fontSize:11,color:"#475569"}}>開始<input type="number" value={shiftEdit.start} onChange={e=>setShiftEdit(p=>({...p,start:+e.target.value}))} min={0} max={23} style={{width:40,padding:"4px",borderRadius:4,border:"1px solid #CBD5E1",fontSize:12,marginLeft:4}}/>時</label>
                    <label style={{fontSize:11,color:"#475569"}}>終了<input type="number" value={shiftEdit.end} onChange={e=>setShiftEdit(p=>({...p,end:+e.target.value}))} min={0} max={23} style={{width:40,padding:"4px",borderRadius:4,border:"1px solid #CBD5E1",fontSize:12,marginLeft:4}}/>時</label>
                    <button onClick={saveShift} style={{...btnS,background:"#16A34A",color:"#FFF",border:"none",fontSize:10}}>保存</button>
                    <button onClick={()=>setShiftEdit(null)} style={{...btnS,fontSize:10}}>取消</button>
                  </React.Fragment>:<React.Fragment>
                    <span style={{fontWeight:600,color:v.color,fontSize:13}}>{v.name}</span>
                    <span style={{fontSize:12,color:"#475569"}}>{v.time}</span>
                    <button onClick={()=>startShiftEdit(k,v)} style={{...btnS,fontSize:10,padding:"2px 8px",marginLeft:"auto"}}>編集</button>
                  </React.Fragment>}
                </div>
              ))}
            </div>
          </div>}
          {tab==="role"&&<div>
            <div style={{fontSize:12,color:"#475569",marginBottom:12}}>職種の追加・編集ができます。スタッフ登録やシフト人員基準に反映されます。</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              {Object.entries(roles).map(([k,v])=>{
                const count=staff.filter(s=>s.role===k).length;
                if(roleEdit&&roleEdit.key===k) return(
                  <div key={k} style={{padding:10,borderRadius:8,border:"1.5px solid #60A5FA",background:"#EFF6FF",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <input value={roleEdit.label} onChange={e=>setRoleEdit(p=>({...p,label:e.target.value}))} placeholder="職種名" style={{padding:"4px 8px",borderRadius:4,border:"1px solid #CBD5E1",fontSize:12,width:100}}/>
                    <div style={{display:"flex",gap:3}}>{ROLE_COLORS.map((c,ci)=>(
                      <div key={ci} onClick={()=>setRoleEdit(p=>({...p,colorIdx:ci}))} style={{width:20,height:20,borderRadius:4,background:ROLE_BGS[ci],border:`2px solid ${roleEdit.colorIdx===ci?c:"transparent"}`,cursor:"pointer"}}/>
                    ))}</div>
                    <button onClick={()=>{if(!roleEdit.label.trim())return;setRoles(p=>({...p,[k]:{label:roleEdit.label,color:ROLE_COLORS[roleEdit.colorIdx],bg:ROLE_BGS[roleEdit.colorIdx]}}));setRoleEdit(null);}} style={{...btnS,background:"#16A34A",color:"#FFF",border:"none",fontSize:10}}>保存</button>
                    <button onClick={()=>setRoleEdit(null)} style={{...btnS,fontSize:10}}>取消</button>
                  </div>
                );
                return(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:"1px solid #E2E8F0"}}>
                    <span style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:4,color:v.color,background:v.bg}}>{v.label}</span>
                    <span style={{flex:1,fontSize:12,color:"#64748B"}}>{count}名在籍</span>
                    <button onClick={()=>{const ci=ROLE_COLORS.indexOf(v.color);setRoleEdit({key:k,label:v.label,colorIdx:ci>=0?ci:0});}} style={{...btnS,fontSize:10,padding:"2px 8px"}}>編集</button>
                    {count===0&&<button onClick={()=>{setRoles(p=>{const n={...p};delete n[k];return n;});setMinStaff(p=>{const n={...p};delete n[k];return n;});}} style={{...btnS,fontSize:10,padding:"2px 8px",color:"#DC2626",border:"1px solid #FECACA"}}>削除</button>}
                  </div>
                );
              })}
            </div>
            <div style={{padding:10,borderRadius:8,border:"1.5px dashed #CBD5E1",background:"#F8FAFC"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#475569",marginBottom:6}}>新しい職種を追加</div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <input value={newRole.key} onChange={e=>setNewRole(p=>({...p,key:e.target.value.replace(/[^a-zA-Z0-9_]/g,"")}))} placeholder="ID（英数字）" style={{padding:"4px 8px",borderRadius:4,border:"1px solid #CBD5E1",fontSize:12,width:90}}/>
                <input value={newRole.label} onChange={e=>setNewRole(p=>({...p,label:e.target.value}))} placeholder="表示名" style={{padding:"4px 8px",borderRadius:4,border:"1px solid #CBD5E1",fontSize:12,width:90}}/>
                <div style={{display:"flex",gap:3}}>{ROLE_COLORS.map((c,ci)=>(
                  <div key={ci} onClick={()=>setNewRole(p=>({...p,colorIdx:ci}))} style={{width:18,height:18,borderRadius:3,background:ROLE_BGS[ci],border:`2px solid ${newRole.colorIdx===ci?c:"transparent"}`,cursor:"pointer"}}/>
                ))}</div>
                <button onClick={()=>{if(!newRole.key.trim()||!newRole.label.trim()||roles[newRole.key])return;setRoles(p=>({...p,[newRole.key]:{label:newRole.label,color:ROLE_COLORS[newRole.colorIdx],bg:ROLE_BGS[newRole.colorIdx]}}));setMinStaff(p=>({...p,[newRole.key]:0}));setNewRole({key:"",label:"",colorIdx:0});}} style={{...btnS,background:"#1D4ED8",color:"#FFF",border:"1px solid #1D4ED8",fontSize:10}}>追加</button>
              </div>
              {newRole.key&&roles[newRole.key]&&<div style={{fontSize:10,color:"#DC2626",marginTop:4}}>このIDは既に使われています</div>}
            </div>
          </div>}
          {tab==="min"&&<div>
            <div style={{fontSize:12,color:"#475569",marginBottom:12}}>1日あたりの最低出勤人数を職種ごとに設定</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {Object.entries(roles).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:"1px solid #E2E8F0"}}>
                  <RB role={k}/><span style={{flex:1,fontSize:13,fontWeight:500}}>{v.label}</span>
                  <label style={{fontSize:12,color:"#475569"}}>最低
                    <input type="number" value={minStaff[k]||0} onChange={e=>setMinStaff(p=>({...p,[k]:Math.max(0,+e.target.value)}))} min={0} max={20} style={{width:44,padding:"4px 6px",borderRadius:4,border:"1px solid #CBD5E1",fontSize:13,marginLeft:6,textAlign:"center"}}/>
                  名</label>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

/* ─── Summary Dashboard ─── */
function SummaryView({staff,shifts,shiftTypes,year,month}){
  const dim=daysIn(year,month);
  const workKeys=Object.keys(shiftTypes).filter(k=>k!=="off");

  const stats=useMemo(()=>{
    return staff.map(s=>{
      let workDays=0,offDays=0,unset=0,hours=0;
      const bySh={};workKeys.forEach(k=>{bySh[k]=0;});
      for(let d=1;d<=dim;d++){
        const sh=shifts[sk(s.id,year,month,d)];
        if(!sh){unset++;continue;}
        if(sh==="off"){offDays++;continue;}
        workDays++;
        const st=shiftTypes[sh];
        if(st)hours+=st.end-st.start;
        if(bySh[sh]!==undefined)bySh[sh]++;
      }
      return{...s,workDays,offDays,unset,hours,bySh};
    });
  },[staff,shifts,shiftTypes,year,month,dim]);

  const avgWork=stats.length?Math.round(stats.reduce((a,s)=>a+s.workDays,0)/stats.length*10)/10:0;
  const avgHours=stats.length?Math.round(stats.reduce((a,s)=>a+s.hours,0)/stats.length*10)/10:0;

  const roleGroups=useMemo(()=>{const g={};staff.forEach(s=>{if(!g[s.role])g[s.role]=[];g[s.role].push(s.id);});return g;},[staff]);

  return(
    <div style={{margin:"0 12px 12px"}}>
      {/* Summary cards */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        <div style={{padding:"10px 16px",borderRadius:8,background:"#F0FDF4",border:"1.5px solid #BBF7D0",flex:1,minWidth:120}}>
          <div style={{fontSize:10,color:"#15803D",fontWeight:600}}>平均出勤日数</div>
          <div style={{fontSize:22,fontWeight:700,color:"#166534"}}>{avgWork}<span style={{fontSize:12,fontWeight:500}}>日</span></div>
        </div>
        <div style={{padding:"10px 16px",borderRadius:8,background:"#EFF6FF",border:"1.5px solid #BFDBFE",flex:1,minWidth:120}}>
          <div style={{fontSize:10,color:"#1D4ED8",fontWeight:600}}>平均労働時間</div>
          <div style={{fontSize:22,fontWeight:700,color:"#1E40AF"}}>{avgHours}<span style={{fontSize:12,fontWeight:500}}>h</span></div>
        </div>
        <div style={{padding:"10px 16px",borderRadius:8,background:"#FFF7ED",border:"1.5px solid #FED7AA",flex:1,minWidth:120}}>
          <div style={{fontSize:10,color:"#C2410C",fontWeight:600}}>スタッフ数</div>
          <div style={{fontSize:22,fontWeight:700,color:"#9A3412"}}>{staff.length}<span style={{fontSize:12,fontWeight:500}}>名</span></div>
        </div>
      </div>

      {/* Per-staff table */}
      <div style={{overflowX:"auto",border:"1px solid #E2E8F0",borderRadius:8}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:12}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            <th style={{padding:"8px 10px",textAlign:"left",borderBottom:"2px solid #CBD5E1",fontSize:11,fontWeight:700,color:"#475569",minWidth:140}}>スタッフ</th>
            <th style={{padding:"8px 6px",textAlign:"center",borderBottom:"2px solid #CBD5E1",fontSize:11,fontWeight:700,color:"#475569",width:60}}>出勤</th>
            <th style={{padding:"8px 6px",textAlign:"center",borderBottom:"2px solid #CBD5E1",fontSize:11,fontWeight:700,color:"#475569",width:60}}>休日</th>
            <th style={{padding:"8px 6px",textAlign:"center",borderBottom:"2px solid #CBD5E1",fontSize:11,fontWeight:700,color:"#475569",width:60}}>未設定</th>
            <th style={{padding:"8px 6px",textAlign:"center",borderBottom:"2px solid #CBD5E1",fontSize:11,fontWeight:700,color:"#475569",width:70}}>総時間</th>
            {workKeys.map(k=><th key={k} style={{padding:"8px 6px",textAlign:"center",borderBottom:"2px solid #CBD5E1",fontSize:11,fontWeight:700,color:shiftTypes[k].color,width:50}}>{shiftTypes[k].label}</th>)}
            <th style={{padding:"8px 10px",textAlign:"left",borderBottom:"2px solid #CBD5E1",fontSize:11,fontWeight:700,color:"#475569",minWidth:100}}>バランス</th>
          </tr></thead>
          <tbody>
            {stats.map(s=>{
              const diff=s.workDays-avgWork;
              const barW=Math.min(Math.abs(diff)/avgWork*100,100);
              const overwork=diff>2;const underwork=diff<-2;
              return <tr key={s.id} style={{borderBottom:"1px solid #E2E8F0",background:overwork?"#FFF7ED":underwork?"#EFF6FF":"transparent"}}>
                <td style={{padding:"6px 10px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><RB role={s.role}/><span style={{fontWeight:500}}>{s.name}</span></div></td>
                <td style={{textAlign:"center",fontWeight:600}}>{s.workDays}</td>
                <td style={{textAlign:"center",fontWeight:600,color:"#DC2626"}}>{s.offDays}</td>
                <td style={{textAlign:"center",color:"#94A3B8"}}>{s.unset||"—"}</td>
                <td style={{textAlign:"center",fontWeight:600}}>{s.hours}h</td>
                {workKeys.map(k=><td key={k} style={{textAlign:"center",color:shiftTypes[k].color,fontWeight:600}}>{s.bySh[k]||"—"}</td>)}
                <td style={{padding:"6px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:60,height:8,background:"#E2E8F0",borderRadius:4,overflow:"hidden",position:"relative"}}>
                      <div style={{position:"absolute",left:diff>=0?"50%":"auto",right:diff<0?"50%":"auto",width:`${barW/2}%`,height:"100%",background:overwork?"#EA580C":underwork?"#2563EB":"#94A3B8",borderRadius:4}}/>
                    </div>
                    <span style={{fontSize:10,fontWeight:600,color:overwork?"#EA580C":underwork?"#2563EB":"#64748B",minWidth:30}}>{diff>0?"+":""}{Math.round(diff*10)/10}</span>
                  </div>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Monthly View (compact) ─── */
function MonthlyView({staff,year,month,shifts,shiftTypes,onToggle,onDayClick,allV,selectedRole,dailyS,onBulkFill,prefData,showPrefOverlay}){
  const dim=daysIn(year,month);const filtered=selectedRole==="all"?staff:staff.filter(s=>s.role===selectedRole);
  const cycle=[null,...Object.keys(shiftTypes)];
  const ds=useMemo(()=>{const r=[];for(let d=1;d<=dim;d++){const c={};Object.keys(shiftTypes).forEach(k=>{c[k]=0;});staff.forEach(s=>{const x=shifts[sk(s.id,year,month,d)];if(x&&c[x]!==undefined)c[x]++;});r.push(c);}return r;},[shifts,year,month,dim,staff,shiftTypes]);

  return(
    <div className="print-table-wrap" style={{overflowX:"auto",overflowY:"auto",maxHeight:"calc(100vh - 320px)",margin:"0 12px 12px",border:"1px solid var(--grid)",borderRadius:8}}>
      <table style={{borderCollapse:"collapse",width:"max-content",fontSize:13}}>
        <thead><tr>
          <th style={{position:"sticky",left:0,top:0,zIndex:4,background:"var(--sf2)",padding:"6px 8px",borderRight:"2px solid var(--gs)",borderBottom:"2px solid var(--gs)",fontSize:11,fontWeight:700,color:"var(--t2)",minWidth:160,textAlign:"left"}}>スタッフ</th>
          {Array.from({length:dim},(_,i)=>{const d=i+1,su=isSun(year,month,d),sa=isSat(year,month,d);const ds2=dailyS[d],hs=ds2&&ds2.shortages.length>0;
            return <th key={d} onClick={()=>onDayClick(d)} style={{position:"sticky",top:0,zIndex:3,background:hs?"#FFF7ED":su?"#FEF2F2":sa?"#FFF7ED":"var(--sf2)",padding:"4px 2px",minWidth:38,textAlign:"center",borderRight:"1px solid var(--grid)",borderBottom:"2px solid var(--gs)",cursor:"pointer",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"}}>
              <div style={{fontSize:12,fontWeight:700,color:su?"#DC2626":sa?"#EA580C":"var(--tx)"}}>{d}</div>
              <div style={{fontSize:10,color:su?"#EF4444":sa?"#F97316":"var(--t2)"}}>{DOW[dowN(year,month,d)]}</div>
            </th>;
          })}
        </tr></thead>
        <tbody>
          {filtered.map(s=>{const vi=allV[s.id]||[],vSet=new Set(vi.map(v=>v.day)),vMap={};vi.forEach(v=>{vMap[v.day]=v.message;});
            return <tr key={s.id}>
              <td style={{position:"sticky",left:0,zIndex:2,padding:"4px 6px",background:"var(--sf)",borderRight:"2px solid var(--gs)",borderBottom:"1px solid var(--grid)",whiteSpace:"nowrap",minWidth:160,fontSize:12}}>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <RB role={s.role}/>
                  {s.empType&&s.empType!=="fulltime"&&EMP_TYPES[s.empType]&&<span style={{fontSize:8,fontWeight:600,padding:"0 3px",borderRadius:3,color:EMP_TYPES[s.empType].color,background:EMP_TYPES[s.empType].bg}}>{EMP_TYPES[s.empType].label}</span>}
                  <span style={{fontWeight:500,color:"var(--tx)",flex:1}}>{s.name}</span>
                  {vi.length>0&&<span style={{fontSize:10,color:"#EF4444",fontWeight:700}}>!</span>}
                  <select className="no-print" onChange={e=>{if(e.target.value)onBulkFill(s.id,e.target.value);e.target.value="";}} defaultValue="" style={{width:20,height:18,opacity:0.4,cursor:"pointer",fontSize:10,border:"none",background:"transparent"}}>
                    <option value="">⋯</option>
                    {(s.allowedShifts||Object.keys(shiftTypes).filter(k=>k!=="off")).map(k=>shiftTypes[k]?<option key={k} value={k}>全日→{shiftTypes[k].name}</option>:null)}
                    <option value="off">全日→休日</option>
                    <option value="__clear">クリア</option>
                  </select>
                </div>
              </td>
              {Array.from({length:dim},(_,i)=>{const d=i+1,key=sk(s.id,year,month,d),sh=shifts[key]||null,hasV=vSet.has(d);
                const pref=showPrefOverlay&&prefData?prefData[key]:null;
                const prefMismatch=pref&&sh&&pref.pref1!==sh&&(!pref.pref2||pref.pref2!==sh);
                return <td key={d} onClick={()=>onToggle(s.id,d)} title={vMap[d]||(pref?`希望: ${shiftTypes[pref.pref1]?.name||pref.pref1}${pref.pref2?" / 第2:"+shiftTypes[pref.pref2]?.name:""}`:"")||(sh&&shiftTypes[sh]?`${shiftTypes[sh].name} ${shiftTypes[sh].time}`:"クリックで割当")} style={{minWidth:38,height:36,textAlign:"center",cursor:"pointer",position:"relative",userSelect:"none",padding:0,borderRight:"1px solid var(--grid)",borderBottom:"1px solid var(--grid)"}}>
                  {sh&&<SB type={sh} shiftTypes={shiftTypes}/>}
                  {hasV&&<span style={{position:"absolute",top:1,right:1,width:7,height:7,borderRadius:"50%",background:"#EF4444",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"}}/>}
                  {pref&&<span style={{position:"absolute",bottom:1,right:1,fontSize:7,fontWeight:600,color:shiftTypes[pref.pref1]?.color||"#475569",background:shiftTypes[pref.pref1]?.bg||"#F1F5F9",borderRadius:2,padding:"0 2px",opacity:0.8,border:`0.5px solid ${shiftTypes[pref.pref1]?.border||"#CBD5E1"}`}}>{shiftTypes[pref.pref1]?.label||pref.pref1}</span>}
                  {prefMismatch&&<span style={{position:"absolute",top:1,left:1,width:6,height:6,borderRadius:"50%",background:"#F59E0B"}}/>}
                </td>;
              })}
            </tr>;
          })}
        </tbody>
        <tfoot>
          <tr><td style={{position:"sticky",left:0,zIndex:2,padding:"4px 8px",background:"var(--sf2)",borderRight:"2px solid var(--gs)",borderTop:"2px solid var(--gs)",fontSize:10,fontWeight:700,color:"var(--t2)"}}>シフト別</td>
            {ds.map((s,i)=><td key={i} style={{textAlign:"center",padding:"2px 1px",borderRight:"1px solid var(--grid)",borderTop:"2px solid var(--gs)",background:"var(--sf2)",fontSize:9,lineHeight:1.4,WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"}}>
              {Object.entries(s).filter(([k])=>k!=="off").map(([k,n])=>n>0?<div key={k} style={{color:shiftTypes[k]?.color,fontWeight:600}}>{shiftTypes[k]?.label}{n}</div>:null)}
            </td>)}
          </tr>
          <tr><td style={{position:"sticky",left:0,zIndex:2,padding:"4px 8px",background:"var(--sf2)",borderRight:"2px solid var(--gs)",fontSize:10,fontWeight:700,color:"var(--t2)"}}>人員充足</td>
            {Array.from({length:dim},(_,i)=>{const d=i+1,ds2=dailyS[d];const ok=ds2&&ds2.shortages.length===0;const w=ds2?Object.values(ds2.counts).reduce((a,b)=>a+b,0):0;
              return <td key={i} style={{textAlign:"center",padding:"2px 1px",borderRight:"1px solid var(--grid)",background:"var(--sf2)",fontSize:9}}>
                {w===0?<span style={{color:"var(--t2)"}}>—</span>:ok?<span style={{color:"#16A34A",fontWeight:700}}>✓</span>:<span style={{color:"#EA580C",fontWeight:700,cursor:"help"}} title={ds2.shortages.map(s=>`${ROLES[s.role].label} ${s.current}/${s.required}`).join("\n")}>▼{ds2.shortages.reduce((a,s)=>a+s.deficit,0)}</span>}
              </td>;
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ─── Daily View ─── */
function DailyView({staff,year,month,day,shifts,shiftTypes,onToggle,dailyS,minStaff}){
  const HS=6,HE=22,HN=HE-HS;
  const roleGroups=useMemo(()=>{const g={};staff.forEach(s=>{if(!g[s.role])g[s.role]=[];g[s.role].push(s);});return Object.entries(g);},[staff]);
  const ds=dailyS[day];const su=isSun(year,month,day),sa=isSat(year,month,day);

  return(
    <div style={{margin:"0 12px 12px"}} className="no-print">
      <div style={{padding:"12px 8px 8px",fontSize:22,fontWeight:700,color:su?"#DC2626":sa?"#EA580C":"var(--tx)"}}>{month+1}月{day}日（{DOW[dowN(year,month,day)]}）</div>
      {ds&&<div style={{padding:"0 8px 12px",display:"flex",gap:6,flexWrap:"wrap"}}>
        {Object.entries(ROLES).map(([role,info])=>{const count=ds.counts[role]||0,min=minStaff[role]||0,ok=count>=min;
          return <div key={role} style={{padding:"6px 10px",borderRadius:8,fontSize:11,display:"flex",alignItems:"center",gap:6,background:ok?"#F0FDF4":"#FFF7ED",border:`1.5px solid ${ok?"#BBF7D0":"#FED7AA"}`}}>
            <span style={{fontWeight:600,color:info.color}}>{info.label}</span>
            <span style={{fontWeight:700,fontSize:14,color:ok?"#16A34A":"#EA580C"}}>{count}</span><span style={{color:"#475569"}}>/{min}</span>
            {!ok&&<span style={{color:"#EA580C",fontWeight:700}}>不足{min-count}</span>}
          </div>;
        })}
      </div>}
      <div style={{overflowX:"auto",border:"1px solid #E2E8F0",borderRadius:8}}>
        <table style={{borderCollapse:"collapse",width:"100%",minWidth:700,fontSize:12}}>
          <thead><tr>
            <th style={{width:160,minWidth:160,padding:"8px 10px",textAlign:"left",background:"#F8FAFC",borderRight:"2px solid #CBD5E1",borderBottom:"2px solid #CBD5E1",fontSize:11,fontWeight:700,color:"#475569"}}>スタッフ</th>
            <th style={{padding:"4px 0",background:"#F8FAFC",borderBottom:"2px solid #CBD5E1"}}><div style={{display:"flex",height:20}}>{Array.from({length:HN},(_,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:10,fontWeight:600,color:"#475569",borderLeft:i>0?"1px solid #E2E8F0":"none"}}>{HS+i}:00</div>)}</div></th>
          </tr></thead>
          <tbody>{roleGroups.map(([role,members])=>{const cnt=ds?ds.counts[role]:0,min=minStaff[role]||0,ok=cnt>=min;
            return <React.Fragment key={role}>
              <tr><td colSpan={2} style={{padding:"5px 10px",background:ok?"#F8FAFC":"#FFF7ED",borderBottom:"1px solid #E2E8F0"}}><div style={{display:"flex",alignItems:"center",gap:6}}><RB role={role}/><span style={{fontSize:11,fontWeight:600,color:"#475569"}}>出勤{cnt} / 最低{min}</span>{!ok&&<span style={{fontSize:10,fontWeight:700,color:"#EA580C",background:"#FED7AA",padding:"1px 6px",borderRadius:4}}>不足{min-cnt}</span>}</div></td></tr>
              {members.map(s=>{const sh=shifts[sk(s.id,year,month,day)]||null,st=sh?shiftTypes[sh]:null;const barL=st&&sh!=="off"?((st.start-HS)/HN)*100:0;const barW=st&&sh!=="off"?((st.end-st.start)/HN)*100:0;
                return <tr key={s.id} style={{borderBottom:"1px solid #E2E8F0"}}>
                  <td style={{padding:"6px 10px",borderRight:"2px solid #CBD5E1",whiteSpace:"nowrap"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontWeight:500}}>{s.name}</span>{sh&&<SB type={sh} shiftTypes={shiftTypes} size="sm"/>}</div></td>
                  <td style={{padding:"4px 0",position:"relative",height:32}} onClick={()=>onToggle(s.id,day)}>
                    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",cursor:"pointer"}}>{Array.from({length:HN},(_,i)=><div key={i} style={{flex:1,borderLeft:i>0?"1px solid #E2E8F0":"none"}}/>)}</div>
                    {st&&sh!=="off"&&<div style={{position:"absolute",top:4,height:24,left:`${barL}%`,width:`${barW}%`,background:st.bg,border:`1.5px solid ${st.border}`,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:st.color,zIndex:1,overflow:"hidden",whiteSpace:"nowrap"}}>{st.name} {st.time}</div>}
                    {sh==="off"&&<div style={{position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",fontSize:11,color:"#DC2626",fontWeight:600,zIndex:1}}>休日</div>}
                    {!sh&&<div style={{position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",fontSize:10,color:"#94A3B8",zIndex:1}}>未設定</div>}
                  </td>
                </tr>;
              })}
            </React.Fragment>;
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Sample Preference Data Generator ─── */
function generateSamplePrefs(staff,y,m){
  const dim=daysIn(y,m);const prefs={};const ws=["early","day","late"];
  const unsubmitted=new Set([3,9,17,22]);
  staff.forEach(s=>{
    if(unsubmitted.has(s.id))return;
    for(let d=1;d<=dim;d++){
      const key=sk(s.id,y,m,d);const r=Math.random();
      if(r<0.12){prefs[key]={pref1:"off",pref2:null};}
      else if(r<0.16){prefs[key]={pref1:"ng",pref2:null};}
      else{const p1=ws[Math.floor(Math.random()*3)];const others=ws.filter(x=>x!==p1);const p2=Math.random()<0.4?others[Math.floor(Math.random()*others.length)]:null;prefs[key]={pref1:p1,pref2:p2};}
    }
  });
  return prefs;
}

/* ─── Preference Alerts ─── */
function getPrefAlerts(staff,prefData,y,m,minStaff){
  const dim=daysIn(y,m);const alerts=[];
  const submitted=new Set();const total=staff.length;
  staff.forEach(s=>{for(let d=1;d<=dim;d++){if(prefData[sk(s.id,y,m,d)]){submitted.add(s.id);break;}}});
  const unsubmitted=staff.filter(s=>!submitted.has(s.id));
  if(unsubmitted.length>0)alerts.push({type:"unsubmitted",severity:"warn",message:`未提出 ${unsubmitted.length}名: ${unsubmitted.map(s=>s.name).join("、")}`});

  for(let d=1;d<=dim;d++){
    const roleCounts={};Object.keys(ROLES).forEach(r=>{roleCounts[r]={off:0,ng:0,total:0};});
    const shiftCounts={early:0,day:0,late:0};
    staff.forEach(s=>{
      const p=prefData[sk(s.id,y,m,d)];
      if(!p)return;
      if(p.pref1==="off")roleCounts[s.role].off++;
      if(p.pref1==="ng")roleCounts[s.role].ng++;
      if(p.pref1==="early"||p.pref1==="day"||p.pref1==="late")shiftCounts[p.pref1]++;
      roleCounts[s.role].total++;
    });
    Object.entries(minStaff).forEach(([role,min])=>{
      const rc=roleCounts[role];const roleStaff=staff.filter(s=>s.role===role).length;
      const available=roleStaff-rc.off-rc.ng;
      if(available<min)alerts.push({type:"shortage",severity:"error",day:d,message:`${d}日: ${ROLES[role].label} 休+NG=${rc.off+rc.ng}名 → 出勤可能${available}名（最低${min}名）`});
    });
    ["early","day","late"].forEach(sh=>{
      if(shiftCounts[sh]===0&&(shiftCounts.early+shiftCounts.day+shiftCounts.late)>0)
        alerts.push({type:"noshift",severity:"warn",day:d,message:`${d}日: ${DEF_SHIFTS[sh]?.name||sh}の希望者ゼロ`});
    });
  }
  return{alerts,submitted:submitted.size,total,unsubmitted};
}

/* ─── Preference View ─── */
function PrefView({staff,year,month,prefData,setPrefData,shiftTypes,minStaff,onDayClick}){
  const dim=daysIn(year,month);
  const alertInfo=useMemo(()=>getPrefAlerts(staff,prefData,year,month,minStaff),[staff,prefData,year,month,minStaff]);
  const pct=staff.length?Math.round(alertInfo.submitted/staff.length*100):0;

  const dailyPrefSummary=useMemo(()=>{
    const r=[];
    for(let d=1;d<=dim;d++){
      const c={early:0,day:0,late:0,off:0,ng:0};
      staff.forEach(s=>{const p=prefData[sk(s.id,year,month,d)];if(p&&c[p.pref1]!==undefined)c[p.pref1]++;});
      const offNg=c.off+c.ng;
      r.push({...c,offNg,hasConflict:alertInfo.alerts.some(a=>(a.type==="shortage"||a.type==="noshift")&&a.day===d)});
    }
    return r;
  },[staff,prefData,year,month,dim,alertInfo]);

  return(
    <div style={{margin:"0 12px 12px"}}>
      {/* Submission progress */}
      <div style={{padding:"10px 14px",background:"#F8FAFC",borderRadius:8,border:"1px solid #E2E8F0",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569"}}>
          <span style={{fontWeight:500}}>提出状況</span>
          <span><b style={{color:"#0F172A"}}>{alertInfo.submitted}</b>/{staff.length}名（{pct}%）</span>
        </div>
        <div style={{height:8,background:"#E2E8F0",borderRadius:4,overflow:"hidden",margin:"6px 0"}}>
          <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#16A34A":"#3B82F6",borderRadius:4,transition:"width 0.3s"}}/>
        </div>
        {alertInfo.unsubmitted.length>0&&<div style={{fontSize:10,color:"#EA580C"}}>未提出: {alertInfo.unsubmitted.map(s=>s.name).join("、")}</div>}
      </div>

      {/* Alerts */}
      {alertInfo.alerts.filter(a=>a.type!=="unsubmitted").length>0&&(
        <div style={{padding:"10px 14px",background:"#FFF7ED",borderRadius:8,border:"1px solid #FED7AA",marginBottom:10,maxHeight:120,overflowY:"auto"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#9A3412",marginBottom:4}}>競合アラート {alertInfo.alerts.filter(a=>a.type!=="unsubmitted").length}件</div>
          {alertInfo.alerts.filter(a=>a.type!=="unsubmitted").slice(0,8).map((a,i)=>(
            <div key={i} style={{fontSize:10,color:a.severity==="error"?"#991B1B":"#9A3412",marginBottom:2,cursor:a.day?"pointer":"default"}} onClick={()=>a.day&&onDayClick(a.day)}>{a.message}</div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div style={{overflowX:"auto",border:"1px solid #E2E8F0",borderRadius:8}}>
        <table style={{borderCollapse:"collapse",width:"max-content",fontSize:11}}>
          <thead><tr>
            <th style={{position:"sticky",left:0,top:0,zIndex:4,background:"#F8FAFC",padding:"6px 8px",borderRight:"2px solid #CBD5E1",borderBottom:"2px solid #CBD5E1",fontSize:10,fontWeight:600,color:"#475569",minWidth:120,textAlign:"left"}}>スタッフ</th>
            {Array.from({length:dim},(_,i)=>{const d=i+1,su=isSun(year,month,d),sa=isSat(year,month,d);const hasC=dailyPrefSummary[i]?.hasConflict;
              return <th key={d} onClick={()=>onDayClick(d)} style={{position:"sticky",top:0,zIndex:3,background:hasC?"#FFF7ED":su?"#FEF2F2":sa?"#FFF7ED":"#F8FAFC",padding:"4px 2px",minWidth:36,textAlign:"center",borderRight:"0.5px solid #E2E8F0",borderBottom:"2px solid #CBD5E1",cursor:"pointer"}}>
                <div style={{fontSize:11,fontWeight:600,color:su?"#DC2626":sa?"#EA580C":"#0F172A"}}>{d}</div>
                <div style={{fontSize:9,color:su?"#EF4444":sa?"#F97316":"#475569"}}>{DOW[dowN(year,month,d)]}</div>
              </th>;
            })}
          </tr></thead>
          <tbody>
            {staff.map(s=>{
              const hasAny=Array.from({length:dim},(_,i)=>prefData[sk(s.id,year,month,i+1)]).some(Boolean);
              return(
                <tr key={s.id}>
                  <td style={{position:"sticky",left:0,zIndex:2,padding:"4px 6px",background:"#FFF",borderRight:"2px solid #CBD5E1",borderBottom:"0.5px solid #E2E8F0",whiteSpace:"nowrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <RB role={s.role}/><span style={{fontWeight:500,fontSize:11,color:hasAny?"#0F172A":"#94A3B8"}}>{s.name}</span>
                      {!hasAny&&<span style={{fontSize:9,color:"#EA580C",fontWeight:600}}>未提出</span>}
                    </div>
                  </td>
                  {Array.from({length:dim},(_,i)=>{
                    const d=i+1,key=sk(s.id,year,month,d),p=prefData[key];
                    return(
                      <td key={d} style={{textAlign:"center",padding:"2px 1px",borderRight:"0.5px solid #E2E8F0",borderBottom:"0.5px solid #E2E8F0",minWidth:36,height:30}}>
                        {p?(
                          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:1}}>
                            <SB type={p.pref1} shiftTypes={{...shiftTypes,ng:{label:"NG",color:"#FFF",bg:"#475569",border:"#334155"}}} size="sm"/>
                            {p.pref2&&<span style={{fontSize:7,fontWeight:600,color:shiftTypes[p.pref2]?.color,background:shiftTypes[p.pref2]?.bg,borderRadius:2,padding:"0 2px",border:`0.5px solid ${shiftTypes[p.pref2]?.border}`}}>{shiftTypes[p.pref2]?.label}</span>}
                          </div>
                        ):(hasAny?<span style={{color:"#CBD5E1",fontSize:9}}>−</span>:null)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot><tr>
            <td style={{position:"sticky",left:0,zIndex:2,padding:"4px 8px",background:"#F8FAFC",borderRight:"2px solid #CBD5E1",borderTop:"2px solid #CBD5E1",fontSize:9,fontWeight:600,color:"#475569"}}>希望集計</td>
            {dailyPrefSummary.map((s,i)=>(
              <td key={i} style={{textAlign:"center",padding:"2px 1px",borderRight:"0.5px solid #E2E8F0",borderTop:"2px solid #CBD5E1",background:s.hasConflict?"#FFF7ED":"#F8FAFC",fontSize:8,lineHeight:1.4}}>
                {s.early>0&&<div style={{color:"#B45309"}}>早{s.early}</div>}
                {s.day>0&&<div style={{color:"#1D4ED8"}}>日{s.day}</div>}
                {s.late>0&&<div style={{color:"#6D28D9"}}>遅{s.late}</div>}
                {s.offNg>0&&<div style={{color:"#DC2626",fontWeight:s.hasConflict?700:400}}>休{s.offNg}{s.hasConflict?"⚠":""}</div>}
              </td>
            ))}
          </tr></tfoot>
        </table>
      </div>

      {/* Generate sample button */}
      <div style={{padding:"10px 0",textAlign:"center"}}>
        <button onClick={()=>setPrefData(generateSamplePrefs(staff,year,month))} style={{padding:"6px 14px",borderRadius:6,border:"1px solid #E2E8F0",background:"#F8FAFC",cursor:"pointer",fontSize:11,fontWeight:600,color:"#475569"}}>デモ: サンプル希望データを生成</button>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function ShiftManager(){
  const today=new Date();
  const[year,setYear]=useState(today.getFullYear());
  const[month,setMonth]=useState(today.getMonth());
  const[shifts,setShifts]=useState({});
  const[staff,setStaff]=useState(INIT_STAFF);
  const[shiftTypes,setShiftTypes]=useState(DEF_SHIFTS);
  const[minStaff,setMinStaff]=useState(DEF_MIN);
  const[roles,setRoles]=useState(DEF_ROLES);
  ROLES=roles;
  const[selectedRole,setSelectedRole]=useState("all");
  const[view,setView]=useState("monthly");
  const[selectedDay,setSelectedDay]=useState(today.getDate());
  const[weekStart,setWeekStart]=useState(()=>Math.max(1,today.getDate()-today.getDay()));
  const[showAlerts,setShowAlerts]=useState(false);
  const[showSettings,setShowSettings]=useState(false);
  const[lockedMonths,setLockedMonths]=useState({});
  const[showAuthDialog,setShowAuthDialog]=useState(null);
  const[prefData,setPrefData]=useState({});
  const[showPrefOverlay,setShowPrefOverlay]=useState(false);
  const[collections,setCollections]=useState({});
  const[modRequests,setModRequests]=useState([]);
  const[showCollectionDialog,setShowCollectionDialog]=useState(false);
  const[collectionForm,setCollectionForm]=useState({targetYear:today.getFullYear(),targetMonth:today.getMonth()+1,deadline:""});
  const ADMIN_PW="admin123";
  const monthKey=`${year}-${month}`;
  const isLocked=!!lockedMonths[monthKey];
  const isTempUnlocked=lockedMonths[monthKey]==="temp";

  useEffect(()=>{const id="shift-pcss";if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=PCSS;document.head.appendChild(s);}},[]);

  const dim=daysIn(year,month);
  const shiftCycle=useMemo(()=>[null,...Object.keys(shiftTypes)],[shiftTypes]);
  const allV=useMemo(()=>{const r={};staff.forEach(s=>{r[s.id]=checkPV(s.id,shifts,year,month,dim);});return r;},[staff,shifts,year,month,dim]);
  const dailyS=useMemo(()=>{const r={};for(let d=1;d<=dim;d++)r[d]=getDS(staff,shifts,year,month,d,minStaff);return r;},[staff,shifts,year,month,dim,minStaff]);

  const totalPV=Object.values(allV).reduce((a,v)=>a+v.length,0);
  const totalSV=Object.values(dailyS).filter(ds=>ds.shortages.length>0&&Object.values(ds.counts).reduce((a,b)=>a+b,0)>0).length;
  const totalA=totalPV+totalSV;

  const handleToggle=useCallback((sid,d)=>{
    if(isLocked&&!isTempUnlocked){setShowAuthDialog("edit");return;}
    const s=staff.find(x=>x.id===sid);
    const allowed=s?.allowedShifts||Object.keys(shiftTypes).filter(k=>k!=="off");
    const staffCycle=[null,...allowed,"off"];
    setShifts(prev=>{const key=sk(sid,year,month,d),cur=prev[key]||null;const idx=staffCycle.indexOf(cur);const next=staffCycle[(idx+1)%staffCycle.length];if(next===null){const c={...prev};delete c[key];return c;}return{...prev,[key]:next};});
  },[year,month,shiftTypes,isLocked,isTempUnlocked,staff]);

  const handleBulkFill=useCallback((sid,type)=>{
    if(isLocked&&!isTempUnlocked){setShowAuthDialog("edit");return;}
    setShifts(prev=>{const n={...prev};for(let d=1;d<=dim;d++){const key=sk(sid,year,month,d);if(type==="__clear")delete n[key];else n[key]=type;}return n;});
  },[year,month,dim,isLocked,isTempUnlocked]);

  const handleDayClick=(d)=>{setSelectedDay(d);setView("daily");};

  const copyPrevMonth=()=>{
    if(isLocked&&!isTempUnlocked){setShowAuthDialog("edit");return;}
    const pm=month===0?11:month-1;const py=month===0?year-1:year;const pdim=daysIn(py,pm);
    setShifts(prev=>{const n={...prev};staff.forEach(s=>{for(let d=1;d<=Math.min(dim,pdim);d++){const pk=sk(s.id,py,pm,d);const nk=sk(s.id,year,month,d);if(prev[pk]&&!prev[nk])n[nk]=prev[pk];}});return n;});
  };

  const prevP=()=>{if(view==="monthly"){if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1);}
    else if(view==="weekly"){const ns=weekStart-7;if(ns<1){const pm=month===0?11:month-1;const py=month===0?year-1:year;setYear(py);setMonth(pm);setWeekStart(Math.max(1,daysIn(py,pm)-6));}else setWeekStart(ns);}
    else if(view==="daily"){if(selectedDay<=1){const pm=month===0?11:month-1;const py=month===0?year-1:year;setYear(py);setMonth(pm);setSelectedDay(daysIn(py,pm));}else setSelectedDay(d=>d-1);}
    else{if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1);}};
  const nextP=()=>{if(view==="monthly"){if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1);}
    else if(view==="weekly"){const ns=weekStart+7;if(ns>dim){const nm=month===11?0:month+1;const ny=month===11?year+1:year;setYear(ny);setMonth(nm);setWeekStart(1);}else setWeekStart(ns);}
    else if(view==="daily"){if(selectedDay>=dim){const nm=month===11?0:month+1;const ny=month===11?year+1:year;setYear(ny);setMonth(nm);setSelectedDay(1);}else setSelectedDay(d=>d+1);}
    else{if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1);}};

  const periodLabel=view==="monthly"||view==="summary"||view==="prefs"?`${year}年 ${month+1}月`:view==="weekly"?`${month+1}/${weekStart}〜${month+1}/${Math.min(weekStart+6,dim)}`:`${year}年 ${month+1}月${selectedDay}日（${DOW[dowN(year,month,selectedDay)]}）`;

  const autoFill=()=>{const n={...shifts};const wk=Object.keys(shiftTypes).filter(k=>k!=="off");staff.forEach(s=>{for(let d=1;d<=dim;d++){const key=sk(s.id,year,month,d);if(!n[key]){if(isSun(year,month,d))n[key]=Math.random()>0.5?"off":wk[Math.floor(Math.random()*wk.length)];else{const r=Math.random();n[key]=r<0.15?"off":wk[Math.floor(Math.random()*wk.length)];}}}});setShifts(n);};

  const handlePrint=()=>{setView("monthly");setSelectedRole("all");setTimeout(()=>window.print(),200);};

  const activeCollections=useMemo(()=>Object.entries(collections).filter(([,c])=>c.status==="collecting"||c.status==="closed"),[collections]);
  const collectingCount=activeCollections.filter(([,c])=>c.status==="collecting").length;
  const canStartNew=collectingCount<2&&activeCollections.length<2;
  const getCollectionForMonth=(y,m)=>collections[`${y}-${m}`];
  const curCollection=getCollectionForMonth(year,month);

  const startCollection=()=>{
    const{targetYear:ty,targetMonth:tm,deadline:dl}=collectionForm;
    const key=`${ty}-${tm-1}`;
    if(collections[key]&&collections[key].status!=="not_started")return;
    setCollections(p=>({...p,[key]:{status:"collecting",deadline:dl||null,targetYear:ty,targetMonth:tm-1,startedAt:new Date().toISOString()}}));
    setShowCollectionDialog(false);
  };
  const closeCollection=(key)=>{setCollections(p=>({...p,[key]:{...p[key],status:"closed"}}));};
  const reopenCollection=(key)=>{setCollections(p=>({...p,[key]:{...p[key],status:"collecting"}}));};
  const approveModRequest=(idx)=>{
    const req=modRequests[idx];if(!req)return;
    const key=sk(req.staffId,req.targetYear,req.targetMonth,req.day);
    setPrefData(p=>({...p,[key]:{pref1:req.newPref1,pref2:req.newPref2||null}}));
    setModRequests(p=>p.map((r,i)=>i===idx?{...r,status:"approved"}:r));
  };
  const rejectModRequest=(idx)=>{setModRequests(p=>p.map((r,i)=>i===idx?{...r,status:"rejected"}:r));};
  const pendingMods=modRequests.filter(r=>r.status==="pending").length;

  const handleLockMonth=()=>{setLockedMonths(p=>({...p,[monthKey]:"locked"}));};
  const handleUnlockTemp=(pw)=>{
    if(pw===ADMIN_PW){setLockedMonths(p=>({...p,[monthKey]:"temp"}));setShowAuthDialog(null);return true;}
    return false;
  };
  const handleRelockMonth=()=>{setLockedMonths(p=>({...p,[monthKey]:"locked"}));};
  const handleFullUnlock=(pw)=>{
    if(pw===ADMIN_PW){setLockedMonths(p=>{const n={...p};delete n[monthKey];return n;});setShowAuthDialog(null);return true;}
    return false;
  };

  const AuthDialog=()=>{
    const[pw,setPw]=useState("");const[err,setErr]=useState(false);
    const mode=showAuthDialog;
    const handleSubmit=()=>{
      const ok=mode==="unlock"?handleFullUnlock(pw):handleUnlockTemp(pw);
      if(!ok)setErr(true);
    };
    return(
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"#FFF",borderRadius:12,padding:24,width:"100%",maxWidth:380,boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{mode==="unlock"?"シフト確定を解除":"確定済みシフトの編集"}</div>
          <div style={{fontSize:12,color:"#475569",marginBottom:16}}>{mode==="unlock"?"確定を完全に解除します。管理者パスワードを入力してください。":"確定済みのシフトを一時的に編集可能にします。管理者パスワードを入力してください。"}</div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:600,color:"#475569",display:"block",marginBottom:4}}>管理者パスワード</label>
            <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>{if(e.key==="Enter")handleSubmit();}} placeholder="パスワードを入力" autoFocus style={{width:"100%",padding:"8px 12px",borderRadius:6,border:`1.5px solid ${err?"#EF4444":"#CBD5E1"}`,fontSize:13,boxSizing:"border-box"}}/>
            {err&&<div style={{fontSize:11,color:"#EF4444",marginTop:4}}>パスワードが正しくありません</div>}
          </div>
          <div style={{fontSize:10,color:"#94A3B8",marginBottom:12}}>デモ用パスワード: admin123</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowAuthDialog(null)} style={btnS}>キャンセル</button>
            <button onClick={handleSubmit} style={{...btnS,background:"#1D4ED8",color:"#FFF",border:"1px solid #1D4ED8"}}>{mode==="unlock"?"確定解除":"認証して編集"}</button>
          </div>
        </div>
      </div>
    );
  };

  return(
    <div style={{"--sf":"#FFFFFF","--sf2":"#F8FAFC","--tx":"#0F172A","--t2":"#475569","--grid":"#E2E8F0","--gs":"#CBD5E1",fontFamily:"'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif",maxWidth:"100%",color:"var(--tx)",background:"var(--sf)",minHeight:"100vh"}}>
      {showSettings&&<SettingsPanel staff={staff} setStaff={setStaff} shiftTypes={shiftTypes} setShiftTypes={setShiftTypes} minStaff={minStaff} setMinStaff={setMinStaff} roles={roles} setRoles={setRoles} onClose={()=>setShowSettings(false)}/>}
      {showAuthDialog&&<AuthDialog/>}
      {showCollectionDialog&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"#FFF",borderRadius:12,padding:24,width:"100%",maxWidth:380}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:12}}>希望シフトの募集を開始</div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:600,color:"#475569",marginBottom:6}}>対象月</div>
            <div style={{display:"flex",gap:6}}>
              {[0,1,2].map(offset=>{const d=new Date(today.getFullYear(),today.getMonth()+offset+1,1);const ty=d.getFullYear(),tm=d.getMonth()+1;const key=`${ty}-${d.getMonth()}`;const existing=collections[key];const sel=collectionForm.targetYear===ty&&collectionForm.targetMonth===tm;const disabled=existing&&existing.status!=="not_started";
                return <button key={offset} disabled={disabled} onClick={()=>setCollectionForm(p=>({...p,targetYear:ty,targetMonth:tm}))} style={{flex:1,padding:"8px 4px",borderRadius:6,border:sel?"2px solid #1D4ED8":"1px solid #E2E8F0",background:sel?"#DBEAFE":disabled?"#F1F5F9":"#FFF",color:sel?"#1D4ED8":disabled?"#94A3B8":"#475569",fontSize:12,fontWeight:600,cursor:disabled?"default":"pointer",opacity:disabled?0.5:1}}>{ty}年{tm}月{disabled?" (済)":""}</button>;
              })}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:"#475569",marginBottom:6}}>締切日（任意）</div>
            <input type="date" value={collectionForm.deadline} onChange={e=>setCollectionForm(p=>({...p,deadline:e.target.value}))} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1.5px solid #CBD5E1",fontSize:13,boxSizing:"border-box"}}/>
            <div style={{fontSize:10,color:"#94A3B8",marginTop:4}}>空欄の場合は手動で締切ります</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowCollectionDialog(false)} style={{flex:1,padding:"10px",borderRadius:8,border:"1px solid #E2E8F0",background:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer",color:"#475569"}}>キャンセル</button>
            <button onClick={startCollection} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"#1D4ED8",color:"#FFF",fontSize:13,fontWeight:700,cursor:"pointer"}}>募集開始</button>
          </div>
        </div>
      </div>}

      {/* Print header */}
      <div className="print-only" style={{display:"none",padding:"0 8px 8px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:"2px solid #333",paddingBottom:6,marginBottom:6}}>
          <div><span style={{fontSize:18,fontWeight:700}}>勤務シフト表</span><span style={{fontSize:14,fontWeight:600,marginLeft:12}}>{year}年 {month+1}月</span></div>
          <span style={{fontSize:9,color:"#666"}}>印刷日: {new Date().toLocaleDateString("ja-JP")}{isLocked?" ・ 確定済":""}</span>
        </div>
        <div style={{display:"flex",gap:8,fontSize:9,color:"#333",flexWrap:"wrap"}}>
          <span style={{fontWeight:700}}>基準：</span>{Object.entries(minStaff).map(([r,n])=><span key={r}>{ROLES[r]?.label}{n} </span>)}
          <span style={{marginLeft:12,fontWeight:700}}>凡例：</span>{Object.entries(shiftTypes).map(([k,st])=><span key={k}>{st.label}={st.name} </span>)}
        </div>
      </div>

      {/* Header */}
      <div className="no-print" style={{padding:"12px 16px",borderBottom:"1px solid var(--grid)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:18,fontWeight:700,letterSpacing:-0.5}}>シフト管理</div><div style={{fontSize:11,color:"var(--t2)",marginTop:1}}>クリニック ・ 管理者ビュー</div></div>
        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
          <button onClick={()=>setShowSettings(true)} style={{...btnS,fontSize:13,padding:"4px 10px"}}>⚙ 設定</button>
          {!isLocked&&<button onClick={copyPrevMonth} style={btnS}>前月コピー</button>}
          {!isLocked&&<button onClick={autoFill} style={btnS}>自動仮入力</button>}
          {!isLocked&&<button onClick={()=>setShifts({})} style={btnS}>クリア</button>}
          <button onClick={handlePrint} style={{...btnS,background:"#1D4ED8",color:"#FFF",border:"1px solid #1D4ED8"}}>🖨 印刷</button>
          {!isLocked&&<button onClick={handleLockMonth} style={{...btnS,background:"#16A34A",color:"#FFF",border:"1px solid #16A34A"}}>✓ シフト確定</button>}
          {isLocked&&!isTempUnlocked&&<button onClick={()=>setShowAuthDialog("edit")} style={{...btnS,border:"1px solid #F59E0B",background:"#FFF7ED",color:"#B45309"}}>調整モード</button>}
          {isLocked&&!isTempUnlocked&&<button onClick={()=>setShowAuthDialog("unlock")} style={{...btnS,border:"1px solid #FECACA",color:"#DC2626"}}>確定解除</button>}
          {isTempUnlocked&&<button onClick={handleRelockMonth} style={{...btnS,background:"#16A34A",color:"#FFF",border:"1px solid #16A34A"}}>調整完了・再確定</button>}
          {totalA>0&&<button onClick={()=>setShowAlerts(!showAlerts)} style={{...btnS,border:"1px solid #FECACA",background:"#FEF2F2",color:"#DC2626",fontWeight:700}}>⚠ {totalA}件</button>}
        </div>
      </div>

      {/* Lock status banner */}
      {isLocked&&!isTempUnlocked&&<div className="no-print" style={{margin:"0 16px",padding:"8px 14px",background:"#F0FDF4",border:"1.5px solid #BBF7D0",borderRadius:8,display:"flex",alignItems:"center",gap:8,fontSize:12}}>
        <span style={{fontSize:16}}>🔒</span>
        <span style={{fontWeight:700,color:"#166534"}}>{year}年{month+1}月のシフトは確定済みです</span>
        <span style={{color:"#15803D"}}>編集するには「調整モード」から管理者認証が必要です</span>
      </div>}
      {isTempUnlocked&&<div className="no-print" style={{margin:"0 16px",padding:"8px 14px",background:"#FFF7ED",border:"1.5px solid #FED7AA",borderRadius:8,display:"flex",alignItems:"center",gap:8,fontSize:12}}>
        <span style={{fontSize:16}}>🔓</span>
        <span style={{fontWeight:700,color:"#9A3412"}}>調整モード — 一時的に編集可能です</span>
        <span style={{color:"#C2410C"}}>調整が終わったら「調整完了・再確定」を押してください</span>
      </div>}

      {/* Collection status bar */}
      {activeCollections.length>0&&<div className="no-print" style={{margin:"4px 16px 0",display:"flex",gap:8,flexWrap:"wrap"}}>
        {activeCollections.map(([key,c])=>{
          const label=`${c.targetYear}年${c.targetMonth+1}月`;
          const submitted=staff.filter(s=>{for(let d=1;d<=daysIn(c.targetYear,c.targetMonth);d++){if(prefData[sk(s.id,c.targetYear,c.targetMonth,d)])return true;}return false;}).length;
          return <div key={key} style={{flex:1,minWidth:200,padding:"8px 12px",borderRadius:8,border:c.status==="collecting"?"1.5px solid #BFDBFE":"1.5px solid #FED7AA",background:c.status==="collecting"?"#EFF6FF":"#FFFBEB",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",fontSize:11}}>
            <span style={{fontWeight:700,color:c.status==="collecting"?"#1D4ED8":"#B45309"}}>{c.status==="collecting"?"募集中":"締切済"}</span>
            <span style={{fontWeight:600,color:"#0F172A"}}>{label}</span>
            <span style={{color:"#475569"}}>{submitted}/{staff.length}名</span>
            {c.deadline&&<span style={{color:"#64748B"}}>〆{c.deadline.slice(5)}</span>}
            <div style={{marginLeft:"auto",display:"flex",gap:4}}>
              {c.status==="collecting"&&<button onClick={()=>closeCollection(key)} style={{...btnS,fontSize:9,padding:"2px 8px",border:"1px solid #F59E0B",color:"#B45309",background:"#FFF"}}>締切る</button>}
              {c.status==="closed"&&<button onClick={()=>reopenCollection(key)} style={{...btnS,fontSize:9,padding:"2px 8px",border:"1px solid #BFDBFE",color:"#1D4ED8",background:"#FFF"}}>再開</button>}
            </div>
          </div>;
        })}
        {canStartNew&&<button onClick={()=>{setCollectionForm({targetYear:today.getFullYear(),targetMonth:today.getMonth()+2>12?1:today.getMonth()+2,deadline:""});setShowCollectionDialog(true);}} style={{padding:"8px 14px",borderRadius:8,border:"1.5px dashed #CBD5E1",background:"#F8FAFC",cursor:"pointer",fontSize:11,fontWeight:600,color:"#475569",minWidth:120}}>+ 募集を開始</button>}
      </div>}
      {activeCollections.length===0&&<div className="no-print" style={{margin:"4px 16px 0"}}>
        <button onClick={()=>{setCollectionForm({targetYear:today.getFullYear(),targetMonth:today.getMonth()+2>12?1:today.getMonth()+2,deadline:""});setShowCollectionDialog(true);}} style={{padding:"8px 14px",borderRadius:8,border:"1.5px dashed #60A5FA",background:"#EFF6FF",cursor:"pointer",fontSize:12,fontWeight:600,color:"#1D4ED8",width:"100%"}}>+ シフト希望の募集を開始する</button>
      </div>}

      {/* Modification requests */}
      {pendingMods>0&&<div className="no-print" style={{margin:"4px 16px 0",padding:"8px 12px",background:"#FFF7ED",border:"1.5px solid #FED7AA",borderRadius:8,fontSize:11}}>
        <div style={{fontWeight:700,color:"#9A3412",marginBottom:4}}>修正リクエスト {pendingMods}件</div>
        {modRequests.filter(r=>r.status==="pending").map((r,i)=>{const s=staff.find(x=>x.id===r.staffId);const realIdx=modRequests.indexOf(r);
          return <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:"0.5px solid #FED7AA",flexWrap:"wrap"}}>
            <span style={{fontWeight:600,color:"#0F172A"}}>{s?.name||"?"}</span>
            <span style={{color:"#9A3412"}}>{r.targetMonth+1}/{r.day}日: {shiftTypes[r.oldPref1]?.name||"?"}→{shiftTypes[r.newPref1]?.name||"?"}</span>
            {r.reason&&<span style={{color:"#64748B",fontSize:10}}>「{r.reason}」</span>}
            <div style={{marginLeft:"auto",display:"flex",gap:4}}>
              <button onClick={()=>approveModRequest(realIdx)} style={{...btnS,fontSize:9,padding:"2px 8px",background:"#16A34A",color:"#FFF",border:"none"}}>承認</button>
              <button onClick={()=>rejectModRequest(realIdx)} style={{...btnS,fontSize:9,padding:"2px 8px",color:"#DC2626",border:"1px solid #FECACA"}}>却下</button>
            </div>
          </div>;
        })}
      </div>}

      {showAlerts&&<div className="no-print" style={{margin:"8px 16px 0",padding:10,background:"#FEF2F2",borderRadius:8,border:"1px solid #FECACA",maxHeight:160,overflowY:"auto",fontSize:11}}>
        {totalSV>0&&<React.Fragment><div style={{fontWeight:700,color:"#9A3412",marginBottom:2}}>人員不足（{totalSV}日）</div>
          {Object.entries(dailyS).filter(([,ds])=>ds.shortages.length>0&&Object.values(ds.counts).reduce((a,b)=>a+b,0)>0).slice(0,6).map(([d,ds])=><div key={d} style={{color:"#9A3412",paddingLeft:8,cursor:"pointer",marginBottom:1}} onClick={()=>handleDayClick(+d)}>{month+1}/{d}日: {ds.shortages.map(s=>`${ROLES[s.role]?.label}${s.current}/${s.required}`).join(", ")}</div>)}</React.Fragment>}
        {totalPV>0&&<React.Fragment><div style={{fontWeight:700,color:"#991B1B",marginTop:4,marginBottom:2}}>勤務ルール違反（{totalPV}件）</div>
          {Object.entries(allV).flatMap(([id,vi])=>vi.map(v=>({staff:staff.find(s=>s.id===+id)?.name,...v}))).slice(0,6).map((a,i)=><div key={i} style={{color:"#991B1B",paddingLeft:8}}>{a.staff} — {month+1}/{a.day}: {a.message}</div>)}</React.Fragment>}
      </div>}

      {/* Nav + views */}
      <div className="no-print" style={{padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={prevP} style={navB}>‹</button>
          <span style={{fontSize:15,fontWeight:700,minWidth:160,textAlign:"center"}}>{periodLabel}</span>
          <button onClick={nextP} style={navB}>›</button>
        </div>
        <div style={{display:"flex",border:"1.5px solid var(--grid)",borderRadius:7,overflow:"hidden"}}>
          {[{k:"monthly",l:"月次"},{k:"weekly",l:"週次"},{k:"daily",l:"日次"},{k:"summary",l:"サマリー"},{k:"prefs",l:"希望"}].map(v=>(
            <button key={v.k} onClick={()=>{setView(v.k);if(v.k==="weekly"){const wd=dowN(year,month,selectedDay);setWeekStart(Math.max(1,selectedDay-wd));}}} style={{padding:"5px 14px",fontSize:11,fontWeight:600,border:"none",cursor:"pointer",background:view===v.k?"#1D4ED8":"var(--sf)",color:view===v.k?"#FFF":"var(--t2)",borderRight:"1px solid var(--grid)"}}>{v.l}</button>
          ))}
        </div>
      </div>

      {view!=="daily"&&view!=="summary"&&view!=="prefs"&&<div className="no-print" style={{padding:"0 16px 6px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,alignItems:"center"}}>
        <div style={{display:"flex",gap:8,fontSize:11,color:"var(--t2)",flexWrap:"wrap",alignItems:"center"}}>
          {Object.entries(shiftTypes).map(([k,st])=><div key={k} style={{display:"flex",alignItems:"center",gap:3}}><SB type={k} shiftTypes={shiftTypes} size="sm"/><span>{st.name}{st.time?` ${st.time}`:""}</span></div>)}
          {view==="monthly"&&Object.keys(prefData).length>0&&<React.Fragment>
            <span style={{color:"#CBD5E1"}}>|</span>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:11,color:"#475569"}}>
              <div onClick={()=>setShowPrefOverlay(!showPrefOverlay)} style={{width:32,height:18,borderRadius:9,background:showPrefOverlay?"#1D4ED8":"#CBD5E1",position:"relative",cursor:"pointer",transition:"background 0.2s"}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:"#FFF",position:"absolute",top:2,left:showPrefOverlay?16:2,transition:"left 0.2s"}}/>
              </div>
              希望を表示
            </label>
          </React.Fragment>}
        </div>
        {view==="monthly"&&<div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {[{key:"all",label:"全員"},...Object.entries(ROLES).map(([k,v])=>({key:k,label:v.label}))].map(r=><button key={r.key} onClick={()=>setSelectedRole(r.key)} style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",border:selectedRole===r.key?"1.5px solid #1D4ED8":"1px solid var(--grid)",background:selectedRole===r.key?"#EFF6FF":"var(--sf)",color:selectedRole===r.key?"#1D4ED8":"var(--t2)"}}>{r.label}</button>)}
        </div>}
      </div>}

      {view==="monthly"&&<MonthlyView staff={staff} year={year} month={month} shifts={shifts} shiftTypes={shiftTypes} onToggle={handleToggle} onDayClick={handleDayClick} allV={allV} selectedRole={selectedRole} dailyS={dailyS} onBulkFill={handleBulkFill} prefData={prefData} showPrefOverlay={showPrefOverlay}/>}
      {view==="weekly"&&<div className="no-print" style={{overflowX:"auto",margin:"0 12px 12px"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,border:"1px solid var(--grid)",borderRadius:8,overflow:"hidden"}}>
        <thead><tr><th style={{width:150,minWidth:150,padding:"10px 12px",textAlign:"left",background:"var(--sf2)",borderRight:"2px solid var(--gs)",borderBottom:"2px solid var(--gs)",fontSize:12,fontWeight:700,color:"var(--t2)"}}>スタッフ</th>
          {(()=>{const days=[];for(let i=0;i<7;i++){const d=weekStart+i;if(d>=1&&d<=dim)days.push(d);}return days;})().map(d=>{const su=isSun(year,month,d),sa=isSat(year,month,d);return <th key={d} onClick={()=>handleDayClick(d)} style={{background:su?"#FEF2F2":sa?"#FFF7ED":"var(--sf2)",padding:"8px 6px",textAlign:"center",borderRight:"1px solid var(--grid)",borderBottom:"2px solid var(--gs)",cursor:"pointer",minWidth:100}}><div style={{fontSize:14,fontWeight:700,color:su?"#DC2626":sa?"#EA580C":"var(--tx)"}}>{month+1}/{d}</div><div style={{fontSize:12,color:su?"#EF4444":sa?"#F97316":"var(--t2)"}}>{DOW[dowN(year,month,d)]}</div></th>;})}
        </tr></thead>
        <tbody>{Object.entries(ROLES).map(([role])=>{const members=staff.filter(s=>s.role===role);if(!members.length)return null;return <React.Fragment key={role}>
          <tr><td colSpan={8} style={{padding:"6px 12px",background:"var(--sf2)",borderBottom:"1px solid var(--grid)",fontWeight:700,fontSize:11,color:"var(--t2)"}}><RB role={role}/><span style={{marginLeft:4}}>{members.length}名（最低{minStaff[role]||0}名）</span></td></tr>
          {members.map(s=><tr key={s.id}><td style={{padding:"6px 12px",borderRight:"2px solid var(--gs)",borderBottom:"1px solid var(--grid)",whiteSpace:"nowrap",fontWeight:500,fontSize:13}}>{s.name}</td>
            {(()=>{const days=[];for(let i=0;i<7;i++){const d=weekStart+i;if(d>=1&&d<=dim)days.push(d);}return days;})().map(d=>{const sh=shifts[sk(s.id,year,month,d)]||null,st=sh?shiftTypes[sh]:null;return <td key={d} onClick={()=>handleToggle(s.id,d)} style={{textAlign:"center",padding:"6px 4px",borderRight:"1px solid var(--grid)",borderBottom:"1px solid var(--grid)",cursor:"pointer",verticalAlign:"middle"}}>{st?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><SB type={sh} shiftTypes={shiftTypes}/><span style={{fontSize:10,color:st.color,fontWeight:500}}>{st.time}</span></div>:<span style={{fontSize:11,color:"var(--t2)"}}>—</span>}</td>;})}
          </tr>)}
        </React.Fragment>;})}</tbody>
      </table></div>}
      {view==="daily"&&<DailyView staff={staff} year={year} month={month} day={selectedDay} shifts={shifts} shiftTypes={shiftTypes} onToggle={handleToggle} dailyS={dailyS} minStaff={minStaff}/>}
      {view==="summary"&&<SummaryView staff={staff} shifts={shifts} shiftTypes={shiftTypes} year={year} month={month}/>}
      {view==="prefs"&&<PrefView staff={staff} year={year} month={month} prefData={prefData} setPrefData={setPrefData} shiftTypes={shiftTypes} minStaff={minStaff} onDayClick={handleDayClick}/>}

      <div className="no-print" style={{padding:"8px 16px 16px",fontSize:11,color:"var(--t2)",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <span>セルクリック → {Object.values(shiftTypes).map(s=>s.name).join(" → ")} → 未設定 ｜ 行末 ⋯ で一括設定</span>
        <span>スタッフ {staff.length}名</span>
      </div>
    </div>
  );
}

const btnS={padding:"5px 11px",borderRadius:6,border:"1px solid #E2E8F0",background:"#F8FAFC",cursor:"pointer",fontSize:11,fontWeight:600,color:"#475569"};
const navB={width:30,height:30,borderRadius:6,border:"1px solid #E2E8F0",background:"#FFF",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#475569"};
