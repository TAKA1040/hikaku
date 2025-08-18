'use client'

import { useState } from 'react'
import { X, Plus, Check } from 'lucide-react'
import { availableUnits } from '@/store/useAppStore'
import { ProductTypeInfo } from '@/types'
import toast from 'react-hot-toast'

interface AddProductTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productType: Omit<ProductTypeInfo, 'id' | 'createdAt'>) => void
}

export function AddProductTypeModal({ isOpen, onClose, onSubmit }: AddProductTypeModalProps) {
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    defaultUnit: 'g',
    allowedUnits: ['g'] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)


  const handleUnitToggle = (unit: string) => {
    setFormData(prev => {
      const newAllowedUnits = prev.allowedUnits.includes(unit)
        ? prev.allowedUnits.filter(u => u !== unit)
        : [...prev.allowedUnits, unit]
      
      // If defaultUnit is removed from allowed units, change it to the first allowed unit
      const newDefaultUnit = newAllowedUnits.includes(prev.defaultUnit) 
        ? prev.defaultUnit 
        : newAllowedUnits[0] || 'g'
      
      return {
        ...prev,
        allowedUnits: newAllowedUnits,
        defaultUnit: newDefaultUnit
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.label.trim()) {
      toast.error('商品タイプ名を入力してください')
      return
    }
    
    if (formData.allowedUnits.length === 0) {
      toast.error('少なくとも1つの単位を選択してください')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Generate value from label (simple slug)
      const value = formData.label
        .toLowerCase()
        .replace(/[^\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\w]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        || 'custom_type'
      
      const productType: Omit<ProductTypeInfo, 'id' | 'createdAt'> = {
        value,
        label: formData.label.trim(),
        unit: formData.defaultUnit, // For backward compatibility
        defaultUnit: formData.defaultUnit,
        allowedUnits: formData.allowedUnits,
        userId: null // Will be set by the parent component if needed
      }
      
      onSubmit(productType)
      toast.success(`「${formData.label}」を商品タイプに追加しました`)
      onClose()
    } catch {
      toast.error('商品タイプの追加に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              新しい商品タイプを追加
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Product Type Name */}
            <div>
              <label htmlFor="product-type-name" className="block text-sm font-medium text-gray-700 mb-2">
                商品タイプ名 <span className="text-red-500">*</span>
              </label>
              <input
                id="product-type-name"
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="例：冷凍食品、調味料、お菓子"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Default Unit */}
            <div>
              <label htmlFor="default-unit" className="block text-sm font-medium text-gray-700 mb-2">
                基準単位 <span className="text-red-500">*</span>
              </label>
              <select
                id="default-unit"
                value={formData.defaultUnit}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultUnit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {formData.allowedUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                この商品タイプのデフォルトで使用される単位です
              </p>
            </div>

            {/* Allowed Units */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                使用可能な単位 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                {availableUnits.map(unit => {
                  const isSelected = formData.allowedUnits.includes(unit.value)
                  return (
                    <label
                      key={unit.value}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleUnitToggle(unit.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {unit.label}
                      </span>
                      {isSelected && (
                        <Check className="w-3 h-3 text-blue-600 ml-auto" />
                      )}
                    </label>
                  )
                })}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                この商品タイプで使用できる単位を選択してください（複数選択可能）
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.label.trim() || formData.allowedUnits.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                追加
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}