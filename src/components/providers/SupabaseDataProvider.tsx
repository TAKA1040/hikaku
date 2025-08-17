'use client'

import { useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { useAppStore } from '@/store/useAppStore'

export function SupabaseDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { setCurrentUserId, clearUserData } = useAppStore()

  // ユーザー状態の変更に応じてstoreを初期化
  useEffect(() => {
    if (user) {
      setCurrentUserId(user.id)
    } else {
      clearUserData()
    }
  }, [user, setCurrentUserId, clearUserData])

  return <>{children}</>
}