'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { AuthUser } from '@/types'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { useAppStore } from '@/store/useAppStore'
import { SupabaseDataProvider } from './SupabaseDataProvider'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { setCurrentUserId, clearUserData } = useAppStore()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 環境変数チェック
  const hasValidConfig = supabaseUrl && supabaseAnonKey
  
  // Supabase client (only create if config is valid)
  const supabase: SupabaseClient | null = hasValidConfig 
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : null

  useEffect(() => {
    if (!supabase) {
      console.error('Supabase 環境変数が未設定です。NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定してください。')
      setLoading(false)
      return
    }

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const supabaseUser: User = session.user;
        const newUser = {
          id: supabaseUser.id,
          email: supabaseUser.email ?? null,
          fullName: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? null,
          avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
        };
        setUser(newUser);
        // 初期セッション時もユーザーIDを設定
        setCurrentUserId(supabaseUser.id);
      } else {
        clearUserData();
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const supabaseUser: User = session.user;
          const newUser = {
            id: supabaseUser.id,
            email: supabaseUser.email ?? null,
            fullName: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? null,
            avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
          };
          setUser(newUser);
          // ユーザーIDをストアに設定（データ分離のため）
          setCurrentUserId(supabaseUser.id);
        } else {
          setUser(null);
          // ログアウト時はデータをクリア
          clearUserData();
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [supabase, clearUserData, setCurrentUserId]);

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.error('Supabase が初期化されていません')
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) {
      console.error('Google Sign-In Error:', error)
    }
  }

  const signOut = async () => {
    if (!supabase) {
      console.error('Supabase が初期化されていません')
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }

  // 環境変数が未設定の場合は設定画面を表示
  if (!hasValidConfig) {
    return (
      <AuthContext.Provider value={value}>
        <div style={{ padding: 16 }}>
          <p style={{ color: '#b91c1c', fontWeight: 600 }}>環境変数が未設定です</p>
          <p style={{ marginTop: 8 }}>
            .env.local を作成し、NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。
          </p>
          <pre style={{ marginTop: 8, background: '#f3f4f6', padding: 12 }}>
{`# 例 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx`}
          </pre>
        </div>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      <SupabaseDataProvider>
        {children}
      </SupabaseDataProvider>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

