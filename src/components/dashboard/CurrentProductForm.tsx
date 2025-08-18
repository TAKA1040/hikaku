'use client'

import { useState, useEffect } from 'react'
import { useAppStore, availableUnits } from '@/store/useAppStore'
import { useProductTypes } from '@/hooks/useProductTypes'
import { Target, Plus, ShoppingBag, Loader2 } from 'lucide-react'
import { AddProductTypeModal } from '@/components/modals/AddProductTypeModal'
import toast from 'react-hot-toast'

export function CurrentProductForm() {
  const { 
    currentProduct, 
    setCurrentProduct, 
    productTypes: localProductTypes,
    setProductTypes,
    setProductAddPrefill
  } = useAppStore()
  
  // Use Supabase hook for product types
  const { 
    productTypes: dbProductTypes, 
    loading: productTypesLoading, 
    addProductType: addProductTypeToDb 
  } = useProductTypes()
  
  // Modal state for adding new product type
  const [isAddProductTypeModalOpen, setIsAddProductTypeModalOpen] = useState(false)
  
  // Sync database product types with local state
  useEffect(() => {
    if (!productTypesLoading && dbProductTypes.length > 0) {
      setProductTypes(dbProductTypes)
    }
  }, [dbProductTypes, productTypesLoading, setProductTypes])
  
  // Use database product types if available, otherwise fall back to local
  const productTypes = dbProductTypes.length > 0 ? dbProductTypes : localProductTypes

  const currentTypeInfo = productTypes.find(pt => pt.value === currentProduct.type) || productTypes[0]
  const allowedUnits = availableUnits.filter(unit => 
    currentTypeInfo.allowedUnits.includes(unit.value)
  )

  const handleInputChange = (field: string, value: string | number) => {
    let processedValue: string | number
    if (field === 'count') {
      processedValue = parseInt(String(value), 10) || 1
    } else if (field === 'price' || field === 'quantity') {
      processedValue = parseInt(String(value), 10) || 0
    } else {
      processedValue = value
    }
    setCurrentProduct({ [field]: processedValue })
  }

  // Handle "その他" selection
  const handleTypeChange = (newType: string) => {
    if (newType === 'other') {
      setIsAddProductTypeModalOpen(true)
      return
    }
    handleInputChange('type', newType)
  }

  // Handle new product type submission
  const handleAddProductType = async (productType: Parameters<typeof addProductTypeToDb>[0]) => {
    try {
      const newType = await addProductTypeToDb(productType)
      // Update local state immediately
      setProductTypes([...productTypes.filter(pt => pt.value !== 'other'), newType, productTypes.find(pt => pt.value === 'other')!])
      // Switch to the newly created product type
      handleInputChange('type', productType.value)
      setIsAddProductTypeModalOpen(false)
      toast.success(`「${productType.label}」が追加されました`)
    } catch (error) {
      console.error('Error adding product type:', error)
      toast.error('商品タイプの追加に失敗しました')
    }
  }

  // --- Comparison Variants (数量/単位・入り数・価格) ---
  type Variant = {
    id: string
    quantity: number
    unit: string
    count: number
    price: number
  }

  const makeVariant = (q: number, u: string, c: number, p: number): Variant => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    quantity: q,
    unit: u,
    count: c,
    price: p,
  })

  const [variants, setVariants] = useState<Variant[]>([
    makeVariant(currentProduct.quantity || 0, currentProduct.unit || (allowedUnits[0]?.value ?? ''), currentProduct.count || 1, currentProduct.price || 0),
  ])
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants[0]?.id ?? null)

  const addSelectedVariantToProducts = () => {
    const v = variants.find(x => x.id === selectedVariantId) || variants[0]
    if (!v) return
    setProductAddPrefill({
      productType: currentProduct.type,
      name: currentProduct.name,
      quantity: v.quantity,
      unit: v.unit,
      count: v.count,
      price: v.price
    })
    toast.success('選択した行を商品管理に適用しました')
    // 商品管理カードへスクロール
    try {
      const el = document.getElementById('product-management')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch {}
  }

  const updateVariant = (idx: number, field: keyof Variant, value: number | string) => {
    setVariants(prev => {
      const next = [...prev]
      const v = { ...next[idx] }
      if (field === 'quantity' || field === 'count' || field === 'price') {
        v[field] = parseInt(String(value), 10) || (field === 'count' ? 1 : 0)
      } else if (field === 'unit') {
        v.unit = String(value)
      }
      next[idx] = v
      return next
    })
    // Keep row-0 in sync with currentProduct to preserve existing display behavior
    if (idx === 0) {
      if (field === 'unit') {
        handleInputChange('unit', String(value))
      } else if (field === 'quantity') {
        handleInputChange('quantity', value as number)
      } else if (field === 'count') {
        handleInputChange('count', value as number)
      } else if (field === 'price') {
        handleInputChange('price', value as number)
      }
    }
  }

  const addVariantRow = () => {
    setVariants(prev => [
      ...prev,
      makeVariant(0, currentProduct.unit || (allowedUnits[0]?.value ?? ''), 1, 0),
    ])
  }

  const selectVariant = (id: string) => {
    setSelectedVariantId(id)
    const v = variants.find(x => x.id === id)
    if (v) {
      // Reflect into currentProduct, so unit price preview matches selection
      handleInputChange('quantity', v.quantity)
      handleInputChange('unit', v.unit)
      handleInputChange('count', v.count)
      handleInputChange('price', v.price)
    }
  }

  const calcUnitPrice = (q: number, c: number, p: number) => {
    if (q <= 0 || c <= 0 || p <= 0) return 0
    return Math.round((p / (q * c)) * 100) / 100
  }

  const removeSelectedVariant = () => {
    if (!selectedVariantId || variants.length <= 1) return
    setVariants(prev => {
      const next = prev.filter(v => v.id !== selectedVariantId)
      const newSel = next[0]?.id ?? null
      setSelectedVariantId(newSel)
      const fallback = next[0]
      if (fallback) {
        handleInputChange('quantity', fallback.quantity)
        handleInputChange('unit', fallback.unit)
        handleInputChange('count', fallback.count)
        handleInputChange('price', fallback.price)
      }
      return next
    })
  }

  return (
    <div className="card comparison-good">
      <div className="card-header">
        <h2 className="card-title flex items-center text-success-800">
          <Target className="w-6 h-6 mr-2" />
          今目の前の商品
        </h2>
      </div>
      
      <div className="card-content space-y-6">
        {/* Product Type and Name */}
        <div className="form-grid">
          <div>
            <label htmlFor="product-type" className="block text-sm font-medium text-gray-700 mb-2">
              商品タイプ
            </label>
            <div className="relative">
              <select
                id="product-type"
                value={currentProduct.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="input-field"
                disabled={productTypesLoading}
              >
                {productTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {productTypesLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
              商品名（任意）
            </label>
            <input
              id="product-name"
              type="text"
              value={currentProduct.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="商品名を入力"
              className="input-field"
            />
          </div>
        </div>
        
        {/* Variants: compact aligned grid with toolbar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">比較候補</div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-primary inline-flex items-center gap-1 relative z-10 touch-manipulation" onClick={addSelectedVariantToProducts} title="選択中の行を商品追加フォームに適用" aria-disabled={false}>
                <ShoppingBag className="w-4 h-4" /> 選択行を追加
              </button>
              <button type="button" className="btn btn-secondary" onClick={addVariantRow}>
                <Plus className="w-4 h-4" /> 比較行を追加
              </button>
              <button
                type="button"
                onClick={removeSelectedVariant}
                disabled={!selectedVariantId || variants.length <= 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-sm bg-white hover:bg-gray-50 text-red-600 border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="選択中の行を削除"
              >
                選択行を削除
              </button>
            </div>
          </div>

          {/* Header (desktop) */}
          <div className="hidden md:grid md:grid-cols-12 text-xs text-gray-500 px-2">
            <div className="col-span-1">選択</div>
            <div className="col-span-5">単位</div>
            <div className="col-span-2">入り数</div>
            <div className="col-span-3">価格 (円)</div>
            <div className="col-span-1 text-right">単価</div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div key={v.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white/40 rounded-md p-3 border border-gray-200">
                {/* Desktop selection */}
                <div className="hidden md:flex items-center gap-2 md:col-span-1">
                  <input
                    type="radio"
                    name="variantSelect"
                    checked={selectedVariantId === v.id}
                    onChange={() => selectVariant(v.id)}
                  />
                </div>

                {/* Mobile 2-row layout */}
                <div className="md:hidden col-span-1 space-y-3">
                  {/* Row 1: 選択 + 単位入力 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="variantSelect"
                        checked={selectedVariantId === v.id}
                        onChange={() => selectVariant(v.id)}
                      />
                      <span className="text-xs text-gray-500">選択</span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">単位</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={v.quantity || ''}
                          onChange={(e) => updateVariant(idx, 'quantity', e.target.value)}
                          placeholder="30"
                          className="input-field flex-1"
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <select
                          value={v.unit}
                          onChange={(e) => updateVariant(idx, 'unit', e.target.value)}
                          className="input-field flex-1"
                        >
                          {allowedUnits.map(u => (
                            <option key={u.value} value={u.value}>{u.value}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 2: 入り数 + 価格 + 単価 */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">入り数</label>
                      <input
                        type="text"
                        value={v.count || ''}
                        onChange={(e) => updateVariant(idx, 'count', e.target.value)}
                        placeholder="2"
                        className="input-field w-full"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">価格</label>
                      <input
                        type="text"
                        value={v.price || ''}
                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                        placeholder="価格"
                        className="input-field font-semibold"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">単価</label>
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border min-h-[2.5rem] flex items-center">
                        {calcUnitPrice(v.quantity, v.count, v.price) > 0 ? `${calcUnitPrice(v.quantity, v.count, v.price).toFixed(2)}円/${v.unit}` : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:contents">
                  {/* 単位（数量+単位選択） */}
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">単位</label>
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0">
                        <input
                          type="number"
                          value={v.quantity || ''}
                          onChange={(e) => updateVariant(idx, 'quantity', e.target.value)}
                          placeholder="例: 30"
                          className="input-field w-full [appearance:auto] [-moz-appearance:auto]"
                          step={1}
                          min={1}
                        />
                      </div>
                      <select
                        value={v.unit}
                        onChange={(e) => updateVariant(idx, 'unit', e.target.value)}
                        className="input-field flex-1 min-w-0"
                      >
                        {allowedUnits.map(u => (
                          <option key={u.value} value={u.value}>{u.value}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 入り数 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">入り数</label>
                    <input
                      type="number"
                      value={v.count || ''}
                      onChange={(e) => updateVariant(idx, 'count', e.target.value)}
                      placeholder="例: 2"
                      className="input-field w-full [appearance:auto] [-moz-appearance:auto]"
                      step={1}
                      min={1}
                    />
                  </div>

                  {/* 価格 */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">価格 (円)</label>
                    <input
                      type="text"
                      value={v.price || ''}
                      onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                      placeholder="価格"
                      className="input-field font-semibold"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>

                  {/* 単価表示 */}
                  <div className="md:col-span-1 text-right text-sm text-gray-600">
                    {calcUnitPrice(v.quantity, v.count, v.price) > 0 ? `${calcUnitPrice(v.quantity, v.count, v.price).toFixed(2)}円/${v.unit}` : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Unit Price Display */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-700">
            単価: {currentProduct.unitPrice > 0 
              ? `${currentProduct.unitPrice.toFixed(2)}円/${currentProduct.unit}` 
              : '-'
            }
          </div>
          {currentProduct.name && (
            <div className="text-lg text-gray-500 mt-1">
              {currentProduct.name}
            </div>
          )}
          {currentProduct.quantity > 0 && currentProduct.count > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              例：{currentProduct.quantity}{currentProduct.unit} × {currentProduct.count}個入り
            </div>
          )}
        </div>
      </div>
      
      {/* Add Product Type Modal */}
      <AddProductTypeModal
        isOpen={isAddProductTypeModalOpen}
        onClose={() => setIsAddProductTypeModalOpen(false)}
        onSubmit={handleAddProductType}
      />
    </div>
  )
}