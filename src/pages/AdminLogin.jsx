import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) setError('メールアドレスまたはパスワードが正しくありません')
    setLoading(false)
  }

  const ready = email.trim() && password.trim()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: '#F8FAFC',
      fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
    }}>
      <div style={{
        background: '#FFF', borderRadius: 16, padding: 28,
        width: '100%', maxWidth: 360, border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 24,
          }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>管理者ログイン</div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>シフト管理システム</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>メールアドレス</div>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="admin@example.com"
            autoFocus
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: `1.5px solid ${error ? '#EF4444' : '#CBD5E1'}`,
              fontSize: 14, boxSizing: 'border-box', color: '#0F172A',
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>パスワード</div>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter' && ready) handleLogin() }}
            placeholder="パスワードを入力"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: `1.5px solid ${error ? '#EF4444' : '#CBD5E1'}`,
              fontSize: 14, boxSizing: 'border-box', letterSpacing: 2, color: '#0F172A',
            }}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{error}</div>
        )}

        <button
          onClick={handleLogin}
          disabled={!ready || loading}
          style={{
            width: '100%', padding: '12px', borderRadius: 8, border: 'none',
            background: ready && !loading ? '#1D4ED8' : '#CBD5E1',
            color: '#FFF', fontSize: 14, fontWeight: 600,
            cursor: ready && !loading ? 'pointer' : 'default',
          }}
        >
          {loading ? 'ログイン中…' : 'ログイン'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a href="#/" style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'none' }}>← トップに戻る</a>
        </div>
      </div>
    </div>
  )
}
