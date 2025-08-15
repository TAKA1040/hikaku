'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { ShoppingCart, LogOut, Settings, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export function Header() {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('ログアウトしました')
    } catch {
      toast.error('ログアウトに失敗しました')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-8 h-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              価格比較ツール
            </h1>
            <h1 className="text-lg font-bold text-gray-900 sm:hidden">
              価格比較
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                {user.avatarUrl && (
                  <Image
                    src={user.avatarUrl}
                    alt={user.fullName || user.email}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">
                  {user.fullName || user.email}
                </span>
              </div>
            )}
            <button
              onClick={() => toast('設定機能は準備中です')}
              className="btn btn-ghost p-2"
              aria-label="設定"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="btn btn-ghost p-2"
              aria-label="ログアウト"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn btn-ghost p-2"
              aria-label="メニュー"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="space-y-3">
              {user && (
                <div className="flex items-center space-x-3 px-2 py-2">
                  {user.avatarUrl && (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName || user.email}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.fullName || user.email}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  toast('設定機能は準備中です')
                  setIsMenuOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-2 py-3 text-left hover:bg-gray-50 rounded-md"
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">設定</span>
              </button>
              <button
                onClick={() => {
                  handleSignOut()
                  setIsMenuOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-2 py-3 text-left hover:bg-gray-50 rounded-md"
              >
                <LogOut className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">ログアウト</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}