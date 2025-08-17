'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useSupabaseStores } from '@/hooks/useSupabaseStores'
import { Store, Plus, Trash2, Edit3, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface StoreFormData {
  name: string
  location: string
  notes: string
}

export function StoreManagement() {
  const { stores, setStores } = useAppStore()
  const { addStore, updateStore, deleteStore, loading, error, stores: supabaseStores } = useSupabaseStores()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    location: '',
    notes: ''
  })

  // Supabaseから取得したデータをローカル状態に同期
  useEffect(() => {
    setStores(supabaseStores)
  }, [supabaseStores, setStores])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('店舗名を入力してください')
      return
    }

    if (editingId) {
      const updated = await updateStore(editingId, formData)
      if (updated) {
        toast.success('店舗情報を更新しました')
        setEditingId(null)
        setFormData({ name: '', location: '', notes: '' })
      } else {
        toast.error('店舗情報の更新に失敗しました')
      }
    } else {
      const created = await addStore(formData)
      if (created) {
        toast.success('新しい店舗を追加しました')
        setIsAdding(false)
        setFormData({ name: '', location: '', notes: '' })
      } else {
        toast.error('店舗の追加に失敗しました')
      }
    }
  }

  const handleEdit = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    if (store) {
      setFormData({
        name: store.name,
        location: store.location || '',
        notes: store.notes || ''
      })
      setEditingId(storeId)
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', location: '', notes: '' })
  }

  const handleRemove = async (storeId: string) => {
    if (confirm('この店舗を削除しますか？登録された商品も同時に削除されます。')) {
      const ok = await deleteStore(storeId)
      if (ok) {
        toast.success('店舗を削除しました')
      } else {
        toast.error('店舗の削除に失敗しました')
      }
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title flex items-center text-primary-800">
            <Store className="w-6 h-6 mr-2" />
            店舗管理
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>店舗データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title flex items-center text-primary-800">
            <Store className="w-6 h-6 mr-2" />
            店舗管理
          </h2>
        </div>
        <div className="p-8 text-center text-red-600">
          <p>エラー: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="card-title flex items-center text-primary-800">
            <Store className="w-6 h-6 mr-2" />
            店舗管理
          </h2>
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding || editingId !== null}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            店舗を追加
          </button>
        </div>
      </div>

      <div className="card-content space-y-4">
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="form-grid">
              <div>
                <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-2">
                  店舗名 *
                </label>
                <input
                  id="store-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例: イオン○○店"
                  className="input-field"
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="store-location" className="block text-sm font-medium text-gray-700 mb-2">
                  場所・住所
                </label>
                <input
                  id="store-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="例: 東京都渋谷区"
                  className="input-field"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="store-notes" className="block text-sm font-medium text-gray-700 mb-2">
                メモ
              </label>
              <textarea
                id="store-notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="特徴や注意事項など"
                className="input-field resize-none"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                <Save className="w-4 h-4" />
                {editingId ? '更新' : '追加'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                <X className="w-4 h-4" />
                キャンセル
              </button>
            </div>
          </form>
        )}

        {/* Store List */}
        {stores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-1">まだ店舗が登録されていません</p>
            <p className="text-sm">「店舗を追加」ボタンから最初の店舗を登録しましょう</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stores.map((store) => (
              <div
                key={store.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {store.name}
                  </h3>
                  {store.location && (
                    <p className="text-sm text-gray-500 truncate">
                      📍 {store.location}
                    </p>
                  )}
                  {store.notes && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {store.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => store.id && handleEdit(store.id)}
                    disabled={isAdding || editingId !== null || !store.id}
                    className="btn btn-ghost p-2"
                    aria-label="編集"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => store.id && handleRemove(store.id)}
                    disabled={isAdding || editingId !== null || !store.id}
                    className="btn btn-ghost p-2 text-danger-600 hover:text-danger-700"
                    aria-label="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}