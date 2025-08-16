'use client'

import { useAppStore } from '@/store/useAppStore'

export function ComparisonResult() {
  const { getComparisonResult, currentProduct } = useAppStore()
  
  const comparison = getComparisonResult()
  // const currentTypeInfo = productTypes.find(pt => pt.value === currentProduct.type) || productTypes[0]

  if (!comparison) {
    return null
  }

  return (
    <div className={`card text-center ${
      comparison.savings > 0 ? 'comparison-good' : 
      comparison.savings === 0 ? 'comparison-neutral' : 
      'comparison-bad'
    }`}>
      <div className="space-y-6">
        <h3 className="text-3xl font-bold">
          {comparison.savings > 0 ? '🎉 お得です！' : 
           comparison.savings === 0 ? '👌 同じ価格です' : 
           '❌ いつものお店の方が安いです'}
        </h3>
        
        <div className="text-xl space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="font-semibold text-gray-700 mb-1">いつものお店</p>
              <p className="text-lg">
                <strong>{comparison.cheapestRegular.storeName}</strong>
              </p>
              <p className="text-2xl font-bold">
                {comparison.cheapestRegular.unitPrice.toFixed(2)}円/{currentProduct.unit}
              </p>
              {comparison.cheapestRegular.name && (
                <p className="text-sm text-gray-600 mt-1">
                  {comparison.cheapestRegular.name}
                </p>
              )}
            </div>
            
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="font-semibold text-gray-700 mb-1">今目の前の商品</p>
              <p className="text-lg">現在の商品</p>
              <p className="text-2xl font-bold">
                {currentProduct.unitPrice.toFixed(2)}円/{currentProduct.unit}
              </p>
              {currentProduct.name && (
                <p className="text-sm text-gray-600 mt-1">
                  {currentProduct.name}
                </p>
              )}
            </div>
          </div>
          
          <div className={`text-3xl font-bold ${
            comparison.savings > 0 ? 'text-success-700' : 
            comparison.savings === 0 ? 'text-blue-700' : 
            'text-danger-700'
          }`}>
            {comparison.savings > 0 ? (
              <div className="space-y-2">
                <p>
                  {Math.abs(comparison.savings).toFixed(2)}円/{currentProduct.unit} 安い！
                </p>
                <p className="text-xl">
                  ({comparison.savingsPercent.toFixed(1)}% お得)
                </p>
              </div>
            ) : comparison.savings === 0 ? (
              <div className="space-y-2">
                <p>価格は同じです</p>
                <p className="text-xl">どちらで買っても同じ価格</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  {Math.abs(comparison.savings).toFixed(2)}円/{currentProduct.unit} 高い
                </p>
                <p className="text-xl">
                  ({comparison.savingsPercent.toFixed(1)}% 割高)
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {comparison.isCurrentCheaper && (
            <button className="btn btn-success">
              🛒 購入を検討
            </button>
          )}
          <button className="btn btn-outline">
            📊 履歴に保存
          </button>
          <button className="btn btn-outline">
            📱 結果を共有
          </button>
        </div>
      </div>
    </div>
  )
}