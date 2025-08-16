'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { AuthUser } from '@/types'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { useAppStore } from '@/store/useAppStore'

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
  const supabase: SupabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
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
  }, [supabase.auth]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) {
      console.error('Google Sign-In Error:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
