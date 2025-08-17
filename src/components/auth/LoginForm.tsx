'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { LogIn, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error('Login error:', error)
      toast.error('ログインに失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">価格比較ツール</h1>
        <p className="text-gray-600">
          本ツールの利用にはログインが必要です。Googleアカウントでログインして開始してください。
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full btn btn-primary relative"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          <span className="ml-2">
            {loading ? 'ログイン中...' : 'Googleでログイン'}
          </span>
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>ネット接続は初回ログインに必要です。ログイン済みなら、オフラインでも比較とローカル保存が可能です（サーバー同期は現在未対応）。</p>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>ログインすることで、以下に同意したものとみなされます：</p>
        <div className="mt-2 space-x-4">
          <button className="text-primary-600 hover:text-primary-700 underline">
            利用規約
          </button>
          <button className="text-primary-600 hover:text-primary-700 underline">
            プライバシーポリシー
          </button>
        </div>
      </div>
    </div>
  )
}