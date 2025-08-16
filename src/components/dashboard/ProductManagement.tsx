'use client'

import { useEffect, useState } from 'react'
import { useAppStore, availableUnits } from '@/store/useAppStore'
import { ShoppingBag, Plus, Trash2, Edit3, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProductFormData {
  storeId: string
  productType: string
  name: string
  quantity: number
  unit: string
  count: number
  price: number
}

export function ProductManagement() {
  const { 
    stores,
    products,
    productTypes, 
    addProduct, 
    updateProduct, 
    removeProduct,
    addStore,
    productAddPrefill,
    setProductAddPrefill,
  } = useAppStore()
  
  const productsLoading = false
  const productsError = null
  
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [storeInput, setStoreInput] = useState<string>('')
  const [formData, setFormData] = useState<ProductFormData>({
    storeId: '',
    productType: 'toilet_paper',
    name: '',
    quantity: 0,
    unit: 'm',
    count: 1,
    price: 0
  })

  // When a variant is sent from CurrentProductForm, prefill and open the form
  useEffect(() => {
    if (!productAddPrefill) return
    const type = productAddPrefill.productType || 'toilet_paper'
    const typeInfo = productTypes.find(pt => pt.value === type) || productTypes[0]
    const allowed = availableUnits.filter(u => typeInfo.allowedUnits.includes(u.value))
    const unitCandidate = productAddPrefill.unit || typeInfo.defaultUnit
    const unit = allowed.some(u => u.value === unitCandidate) ? unitCandidate : typeInfo.defaultUnit
    setIsAdding(true)
    setEditingId(null)
    setFormData(prev => ({
      ...prev,
      storeId: '',
      productType: type,
      name: productAddPrefill.name || '',
      quantity: productAddPrefill.quantity ?? 0,
      unit,
      count: productAddPrefill.count ?? 1,
      price: productAddPrefill.price ?? 0,
    }))
    setStoreInput('')
    setProductAddPrefill(null)
  }, [productAddPrefill, productTypes, setProductAddPrefill])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedStore = storeInput.trim()
    if (!trimmedStore) {
      toast.error('店舗名を入力または選択してください')
      return
    }
    
    if (formData.quantity <= 0) {
      toast.error('数量は0より大きい値を入力してください')
      return
    }
    
    if (formData.price <= 0) {
      toast.error('価格は0より大きい値を入力してください')
      return
    }

    // Resolve storeId from name; auto-add if not exists
    let useStoreId = stores.find(s => s.name === trimmedStore)?.id || ''
    if (!useStoreId) {
      const newId = crypto.randomUUID()
      addStore({ id: newId, name: trimmedStore, location: '', notes: '' })
      useStoreId = newId
      toast.success('新しい店舗を追加しました')
    }

    const payload = { 
      storeId: useStoreId,
      productType: formData.productType,
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      count: formData.count,
      price: formData.price
    }

    if (editingId) {
      updateProduct(editingId, payload)
      toast.success('商品情報を更新しました')
      setEditingId(null)
    } else {
      addProduct(payload)
      toast.success('新しい商品を追加しました')
      setIsAdding(false)
    }
    
    setFormData({
      storeId: '',
      productType: 'toilet_paper',
      name: '',
      quantity: 0,
      unit: 'm',
      count: 1,
      price: 0
    })
    setStoreInput('')
  }

  const handleEdit = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setFormData({
        storeId: product.storeId,
        productType: product.productType,
        name: product.name || '',
        quantity: product.quantity,
        unit: product.unit || 'm',
        count: product.count,
        price: product.price
      })
      const storeName = stores.find(s => s.id === product.storeId)?.name || ''
      setStoreInput(storeName)
      setEditingId(productId)
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      storeId: '',
      productType: 'toilet_paper',
      name: '',
      quantity: 0,
      unit: 'm',
      count: 1,
      price: 0
    })
    setStoreInput('')
  }

  const handleRemove = (productId: string) => {
    if (confirm('この商品を削除しますか？')) {
      removeProduct(productId)
      toast.success('商品を削除しました')
    }
  }

  const getStoreName = (storeId: string) => {
    return stores.find(s => s.id === storeId)?.name || '不明な店舗'
  }

  const getProductTypeInfo = (type: string) => {
    return productTypes.find(pt => pt.value === type) || productTypes[0]
  }

  const getAllowedUnits = (productType: string) => {
    const typeInfo = getProductTypeInfo(productType)
    return availableUnits.filter(unit => typeInfo.allowedUnits.includes(unit.value))
  }

  const calculateUnitPrice = (quantity: number, count: number, price: number) => {
    if (quantity <= 0 || price <= 0) return 0
    return Math.round((price / (quantity * count)) * 100) / 100
  }

  // Loading state
  if (productsLoading) {
    return (
      <div className="card" id="product-management">
        <div className="card-header">
          <h2 className="card-title flex items-center text-primary-800">
            <ShoppingBag className="w-6 h-6 mr-2" />
            商品管理
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>商品データを読み込み中...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (productsError) {
    return (
      <div className="card" id="product-management">
        <div className="card-header">
          <h2 className="card-title flex items-center text-primary-800">
            <ShoppingBag className="w-6 h-6 mr-2" />
            商品管理
          </h2>
        </div>
        <div className="p-8 text-center text-red-600">
          <p>エラー: {productsError}</p>
        </div>
      </div>
    )
  }

  // Note: Even if there are no stores yet, we allow product creation via free-text store name.

  return (
    <div className="card" id="product-management">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="card-title flex items-center text-primary-800">
            <ShoppingBag className="w-6 h-6 mr-2" />
            商品管理
          </h2>
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding || editingId !== null}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            商品を追加
          </button>
        </div>
      </div>

      <div className="card-content space-y-4">
        <style>{`
          @media (min-width: 768px) {
            input.with-spinner[type="number"] {
              appearance: auto;
              -moz-appearance: auto;
            }
            input.with-spinner[type="number"]::-webkit-outer-spin-button,
            input.with-spinner[type="number"]::-webkit-inner-spin-button {
              -webkit-appearance: auto;
              margin: 0;
            }
          }
        `}</style>
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="form-grid">
              <div>
                <label htmlFor="product-store" className="block text-sm font-medium text-gray-700 mb-2">
                  店舗名 *
                </label>
                <input
                  id="product-store"
                  list="stores-list"
                  type="text"
                  value={storeInput}
                  onChange={(e) => setStoreInput(e.target.value)}
                  placeholder="例: イオン○○店"
                  className="input-field"
                  autoComplete="off"
                  required
                />
                <datalist id="stores-list">
                  {stores.map(s => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label htmlFor="product-type-form" className="block text-sm font-medium text-gray-700 mb-2">
                  商品タイプ *
                </label>
                <select
                  id="product-type-form"
                  value={formData.productType}
                  onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                  className="input-field"
                  required
                >
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="product-name-form" className="block text-sm font-medium text-gray-700 mb-2">
                  商品名
                </label>
                <input
                  id="product-name-form"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例: サランラップ 30m"
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="form-grid">
              <div>
                <label htmlFor="product-quantity-form" className="block text-sm font-medium text-gray-700 mb-2">
                  単位 *
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Desktop: native number input with spinner */}
                    <input
                      id="product-quantity-form"
                      type="number"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 0 }))}
                      placeholder="数量"
                      className="input-field w-full hidden md:block with-spinner"
                      step={1}
                      min={1}
                      style={{ appearance: 'auto' as React.CSSProperties['appearance'] }}
                    />
                    {/* Mobile: text input to ensure numeric keypad */}
                    <input
                      id="product-quantity-form-text"
                      type="text"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 0 }))}
                      placeholder="数量"
                      className="input-field w-full md:hidden"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="input-field flex-1 min-w-0"
                  >
                    {getAllowedUnits(formData.productType).map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="product-count-form" className="block text-sm font-medium text-gray-700 mb-2">
                  入り数 *
                </label>
                <div>
                  {/* Desktop: native number input with spinner */}
                  <input
                    id="product-count-form"
                    type="number"
                    value={formData.count || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value, 10) || 1 }))}
                    placeholder="入り数"
                    className="input-field w-full hidden md:block with-spinner"
                    step={1}
                    min={1}
                    style={{ appearance: 'auto' as React.CSSProperties['appearance'] }}
                  />
                  {/* Mobile: text input to ensure numeric keypad */}
                  <input
                    id="product-count-form-text"
                    type="text"
                    value={formData.count || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value, 10) || 1 }))}
                    placeholder="入り数"
                    className="input-field w-full md:hidden"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="product-price-form" className="block text-sm font-medium text-gray-700 mb-2">
                  価格 (円) *
                </label>
                <input
                  id="product-price-form"
                  type="text"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value, 10) || 0 }))}
                  placeholder="価格"
                  className="input-field"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                />
              </div>
            </div>

            
            {/* Unit Price Preview */}
            {formData.quantity > 0 && formData.price > 0 && (
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">単価プレビュー:</p>
                <p className="font-semibold text-blue-700">
                  {calculateUnitPrice(formData.quantity, formData.count, formData.price).toFixed(2)}円/{formData.unit}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  例：{formData.quantity}{formData.unit} × {formData.count}個入り = {formData.price}円
                </p>
              </div>
            )}
            
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

        {/* Product List */}
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-1">まだ商品が登録されていません</p>
            <p className="text-sm">「商品を追加」ボタンから最初の商品を登録しましょう</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const typeInfo = getProductTypeInfo(product.productType)
              const unitPrice = calculateUnitPrice(product.quantity, product.count, product.price)
              const displayUnit = product.unit || typeInfo.defaultUnit
              
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {typeInfo.label}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {getStoreName(product.storeId)}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 truncate">
                      {product.name || `${typeInfo.label} (${product.quantity}${displayUnit} × ${product.count}個)`}
                    </h3>
                    
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">単価: {unitPrice.toFixed(2)}円/{displayUnit}</span>
                      <span className="mx-2">•</span>
                      <span>総額: {product.price}円</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(product.id!)}
                      disabled={isAdding || editingId !== null}
                      className="btn btn-ghost p-2"
                      aria-label="編集"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(product.id!)}
                      disabled={isAdding || editingId !== null}
                      className="btn btn-ghost p-2 text-red-600 hover:text-red-700"
                      aria-label="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}