import React, { useState, useEffect } from 'react'
import ShiftManager from './pages/ShiftManager'
import StaffShiftRequest from './pages/StaffShiftRequest'
import AdminLogin from './pages/AdminLogin'
import { resetDemoData } from './lib/resetDemo'
import { supabase } from './lib/supabase'

function LandingPage() {
  const [resetting, setResetting] = useState(false)

  const handleReset = async () => {
    if (!window.confirm('デモデータをリセットしますか？\n（スタッフが入力した希望データなども削除されます）')) return
    setResetting(true)
    try {
      await resetDemoData()
      window.location.reload()
    } catch (e) {
      alert('リセットに失敗しました: ' + e.message)
      setResetting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F8FAFC', padding: 24,
      fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, background: '#EFF6FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 32,
        }}>📋</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
          シフト簡単調整ツール
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32, lineHeight: 1.6 }}>
          医療機関・介護施設・整体院向け<br />
          勤務シフトの作成・調整・希望収集をこれ一つで
        </p>

        <div style={{ display: 'flex', gap: 12, flexDirection: 'column', maxWidth: 320, margin: '0 auto' }}>
          <a href="#/admin" style={{
            display: 'block', padding: '16px 20px', borderRadius: 12,
            background: '#1D4ED8', color: '#FFF', textDecoration: 'none',
            fontSize: 15, fontWeight: 600, textAlign: 'center',
            border: 'none', cursor: 'pointer',
          }}>
            管理者画面を開く
            <span style={{ display: 'block', fontSize: 11, fontWeight: 400, marginTop: 4, opacity: 0.8 }}>
              シフト表の作成・調整・確定
            </span>
          </a>

          <a href="#/staff" style={{
            display: 'block', padding: '16px 20px', borderRadius: 12,
            background: '#FFF', color: '#1D4ED8', textDecoration: 'none',
            fontSize: 15, fontWeight: 600, textAlign: 'center',
            border: '1.5px solid #BFDBFE', cursor: 'pointer',
          }}>
            従業員画面を開く
            <span style={{ display: 'block', fontSize: 11, fontWeight: 400, marginTop: 4, color: '#64748B' }}>
              シフト希望の提出
            </span>
          </a>
        </div>

        <div style={{
          marginTop: 40, padding: '16px 20px', background: '#FFF', borderRadius: 12,
          border: '1px solid #E2E8F0', textAlign: 'left',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>デモの見どころ</div>
          <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.9 }}>
            <b style={{ color: '#0F172A' }}>管理者画面:</b> 今月のシフト表・希望集計・アラートを確認<br />
            <b style={{ color: '#0F172A' }}>従業員画面:</b> ID 1〜22 / PW 0000 でログイン → 来月分を提出<br />
            <b style={{ color: '#0F172A' }}>提出後:</b> 管理者の「希望」ビューにリアルタイム反映<br />
            <b style={{ color: '#0F172A' }}>管理者PW:</b> admin123（シフト確定・調整モード用）
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={resetting}
          style={{ fontSize: 11, color: '#94A3B8', marginTop: 24, background: 'none', border: 'none', cursor: resetting ? 'default' : 'pointer', textDecoration: 'underline', opacity: resetting ? 0.5 : 1 }}
        >
          {resetting ? 'リセット中…' : 'デモをリセット'}
        </button>
        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
          Powered by LFU Inc.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/')
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.hash = '#/'
  }

  if (route === '#/admin') {
    if (authLoading) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #DBEAFE', borderTop: '3px solid #1D4ED8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontSize: 14, color: '#475569' }}>認証確認中…</div>
        </div>
      </div>
    )
    if (!session) return <AdminLogin />
    return <ShiftManager onSignOut={handleSignOut} />
  }

  if (route === '#/staff') return <div>
    <a href="#/" style={{
      position: 'fixed', top: 10, right: 16, zIndex: 999,
      padding: '4px 12px', borderRadius: 6, background: '#F8FAFC',
      border: '1px solid #E2E8F0', fontSize: 11, fontWeight: 600,
      color: '#475569', textDecoration: 'none', cursor: 'pointer',
    }}>← トップに戻る</a>
    <StaffShiftRequest />
  </div>

  return <LandingPage />
}
