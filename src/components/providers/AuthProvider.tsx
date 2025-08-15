'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { AuthUser } from '@/types'

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
  const supabase = createClient()

  useEffect(() => {
    // デモ用：初期化時はローディング状態を解除
    console.log('デモモード：認証プロバイダ初期化')
    setLoading(false)
  }, [])

  const signInWithGoogle = async () => {
    // デモ用：実際のGoogleログインの代わりにダミーユーザーを作成
    console.log('デモモード：ダミーユーザーでログイン')
    setUser({
      id: 'demo-user-123',
      email: 'demo@example.com',
      fullName: 'デモユーザー',
      avatarUrl: undefined
    })
    setLoading(false)
  }

  const signOut = async () => {
    // デモ用：シンプルにユーザー状態をクリア
    console.log('デモモード：ログアウト')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
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