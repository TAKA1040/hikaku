import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ShoppingCart, Store, Target } from 'lucide-react';
import { Product, ProductType, ComparisonResult } from './src/types/product';

const PriceComparisonTool = () => {
  const [regularPrices, setRegularPrices] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Omit<Product, 'id'>>({
    type: 'wrap',
    name: '',
    quantity: '',
    count: 1,
    price: '',
    unitPrice: 0
  });

  // デフォルトの商品タイプ
  const productTypes: ProductType[] = [
    { value: 'wrap', label: 'ラップ', unit: 'm' },
    { value: 'toilet_paper', label: 'トイレットペーパー', unit: 'ロール' },
    { value: 'tissue', label: 'ティッシュペーパー', unit: '箱' },
    { value: 'detergent', label: '洗剤', unit: 'ml' },
    { value: 'shampoo', label: 'シャンプー', unit: 'ml' },
    { value: 'rice', label: 'お米', unit: 'kg' },
    { value: 'oil', label: '食用油', unit: 'ml' },
    { value: 'milk', label: '牛乳', unit: 'ml' },
    { value: 'bread', label: 'パン', unit: '枚' },
    { value: 'eggs', label: '卵', unit: '個' }
  ];

  const addRegularPrice = () => {
    const newPrice: Product = {
      id: Date.now(),
      type: 'wrap',
      name: '',
      store: '',
      quantity: '',
      count: 1,
      price: '',
      unitPrice: 0
    };
    setRegularPrices([...regularPrices, newPrice]);
  };

  const updateRegularPrice = (id: number, field: keyof Product, value: string | number) => {
    setRegularPrices(regularPrices.map(product => {
      if (product.id === id) {
        const updated = { ...product, [field]: value };
        
        // 単価計算
        if (field === 'quantity' || field === 'count' || field === 'price') {
          const quantity = parseFloat(updated.quantity.toString()) || 0;
          const count = parseFloat(updated.count.toString()) || 1;
          const price = parseFloat(updated.price.toString()) || 0;
          
          if (quantity > 0 && price > 0) {
            updated.unitPrice = price / (quantity * count);
          }
        }
        
        return updated;
      }
      return product;
    }));
  };

  const updateCurrentProduct = (field: keyof Omit<Product, 'id'>, value: string | number) => {
    const updated = { ...currentProduct, [field]: value };
    
    // 単価計算
    if (field === 'quantity' || field === 'count' || field === 'price') {
      const quantity = parseFloat(updated.quantity.toString()) || 0;
      const count = parseFloat(updated.count.toString()) || 1;
      const price = parseFloat(updated.price.toString()) || 0;
      
      if (quantity > 0 && price > 0) {
        updated.unitPrice = price / (quantity * count);
      } else {
        updated.unitPrice = 0;
      }
    }
    
    setCurrentProduct(updated);
  };

  const removeRegularPrice = (id: number) => {
    setRegularPrices(regularPrices.filter(product => product.id !== id));
  };

  const getProductTypeInfo = (type: string): ProductType => {
    return productTypes.find(pt => pt.value === type) || productTypes[0];
  };

  const getComparison = (): ComparisonResult | null => {
    if (currentProduct.unitPrice === 0) return null;
    
    const sameTypeProducts = regularPrices.filter(p => 
      p.type === currentProduct.type && p.unitPrice > 0
    );
    
    if (sameTypeProducts.length === 0) return null;
    
    const cheapestRegular = sameTypeProducts.reduce((cheapest, current) => 
      current.unitPrice < cheapest.unitPrice ? current : cheapest
    );
    
    const savings = cheapestRegular.unitPrice - currentProduct.unitPrice;
    const savingsPercent = ((savings / cheapestRegular.unitPrice) * 100);
    
    return {
      cheapestRegular,
      savings,
      savingsPercent,
      isCurrentCheaper: savings > 0
    };
  };

  const comparison = useMemo(() => getComparison(), [currentProduct, regularPrices]);
  const currentTypeInfo = useMemo(() => getProductTypeInfo(currentProduct.type), [currentProduct.type]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        <ShoppingCart className="inline mr-3 text-blue-600" />
        価格比較ツール
      </h1>

      <div className="space-y-6">
        {/* 今目の前の商品 - メイン */}
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <h2 className="text-2xl font-semibold mb-4 text-green-800 flex items-center">
            <Target className="mr-2" size={24} />
            今目の前の商品
          </h2>
          
          <div className="bg-white p-6 rounded border shadow-sm">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={currentProduct.type}
                  onChange={(e) => updateCurrentProduct('type', e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-lg"
                >
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => updateCurrentProduct('name', e.target.value)}
                  placeholder="商品名（任意）"
                  className="w-full border border-gray-300 rounded px-4 py-3 text-lg"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  value={currentProduct.quantity}
                  onChange={(e) => updateCurrentProduct('quantity', e.target.value)}
                  placeholder={`${currentTypeInfo.unit}数`}
                  className="border border-gray-300 rounded px-4 py-3 text-lg"
                />
                <input
                  type="number"
                  value={currentProduct.count}
                  onChange={(e) => updateCurrentProduct('count', e.target.value)}
                  placeholder="入り数"
                  className="border border-gray-300 rounded px-4 py-3 text-lg"
                />
                <input
                  type="number"
                  value={currentProduct.price}
                  onChange={(e) => updateCurrentProduct('price', e.target.value)}
                  placeholder="価格 (円)"
                  className="border border-gray-300 rounded px-4 py-3 text-lg font-semibold"
                />
              </div>
              
              <div className="text-center bg-gray-50 p-4 rounded">
                <div className="text-2xl font-bold text-gray-700">
                  単価: {currentProduct.unitPrice > 0 ? `${currentProduct.unitPrice.toFixed(2)}円/${currentTypeInfo.unit}` : '-'}
                </div>
                {currentProduct.name && (
                  <div className="text-lg text-gray-500 mt-1">
                    {currentProduct.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 比較結果 */}
        {comparison && (
          <div className={`p-6 rounded-lg text-center ${comparison.isCurrentCheaper ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'}`}>
            <h3 className="text-3xl font-bold mb-4">
              {comparison.isCurrentCheaper ? '🎉 お得です！' : '❌ いつものお店の方が安いです'}
            </h3>
            
            <div className="text-xl space-y-3">
              <p>
                <strong>いつものお店 ({comparison.cheapestRegular.store}):</strong> 
                {comparison.cheapestRegular.unitPrice.toFixed(2)}円/{currentTypeInfo.unit}
                {comparison.cheapestRegular.name && (
                  <span className="text-lg text-gray-600 ml-2">({comparison.cheapestRegular.name})</span>
                )}
              </p>
              <p>
                <strong>今目の前の商品:</strong> 
                {currentProduct.unitPrice.toFixed(2)}円/{currentTypeInfo.unit}
                {currentProduct.name && (
                  <span className="text-lg text-gray-600 ml-2">({currentProduct.name})</span>
                )}
              </p>
              
              <div className={`text-2xl font-bold ${comparison.isCurrentCheaper ? 'text-green-700' : 'text-red-700'}`}>
                {comparison.isCurrentCheaper ? (
                  <p>
                    {Math.abs(comparison.savings).toFixed(2)}円/{currentTypeInfo.unit} 安い！
                    <br />
                    <span className="text-lg">({Math.abs(comparison.savingsPercent).toFixed(1)}% お得)</span>
                  </p>
                ) : (
                  <p>
                    {Math.abs(comparison.savings).toFixed(2)}円/{currentTypeInfo.unit} 高い
                    <br />
                    <span className="text-lg">({Math.abs(comparison.savingsPercent).toFixed(1)}% 割高)</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* いつものお店の価格登録 */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center">
            <Store className="mr-2" />
            いつものお店の価格を登録・管理
          </h2>
          
          <div className="mb-4">
            <button
              onClick={addRegularPrice}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 flex items-center text-lg"
            >
              <Plus size={20} className="mr-2" />
              新しい商品を追加
            </button>
          </div>

          <div className="space-y-4">
            {regularPrices.map(product => {
              const typeInfo = getProductTypeInfo(product.type);
              return (
                <div key={product.id} className="bg-white p-4 rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <select
                      value={product.type}
                      onChange={(e) => updateRegularPrice(product.id, 'type', e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2"
                    >
                      {productTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={product.store}
                      onChange={(e) => updateRegularPrice(product.id, 'store', e.target.value)}
                      placeholder="店舗名"
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateRegularPrice(product.id, 'name', e.target.value)}
                      placeholder="商品名（任意）"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => updateRegularPrice(product.id, 'quantity', e.target.value)}
                      placeholder={`${typeInfo.unit}数`}
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      value={product.count}
                      onChange={(e) => updateRegularPrice(product.id, 'count', e.target.value)}
                      placeholder="入り数"
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => updateRegularPrice(product.id, 'price', e.target.value)}
                      placeholder="価格"
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-700">
                        単価: {product.unitPrice > 0 ? `${product.unitPrice.toFixed(2)}円/${typeInfo.unit}` : '-'}
                      </span>
                      {product.name && (
                        <span className="text-sm text-gray-500 mt-1">
                          {product.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeRegularPrice(product.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 使い方の説明 */}
      {regularPrices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">使い方:</p>
          <p>1. 左側でいつものお店の商品価格を登録</p>
          <p>2. 右側で今目の前の商品情報を入力</p>
          <p>3. どちらがお得か自動で比較結果が表示されます！</p>
        </div>
      )}
    </div>
  );
};

export default PriceComparisonTool;