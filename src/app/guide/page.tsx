import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Info, CheckCircle2, HelpCircle, Calculator, Store, ArrowRight } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'

export const metadata: Metadata = {
  title: '使い方ガイド - 価格比較ツール',
  description: '価格比較ツールの使い方をわかりやすく解説します',
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 text-balance">使い方ガイド</h1>
              <p className="text-gray-600 text-base sm:text-sm">このページでは、価格比較ツールの基本的な使い方を説明します。</p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <section className="card mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">クイックスタート（3ステップ）</h2>
              <div className="grid gap-3 md:gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-white border">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-2">1</div>
                  <p className="font-medium">店舗を追加（任意）</p>
                  <p className="text-base sm:text-sm text-gray-600">必要に応じて、よく行く店舗を登録します</p>
                </div>
                <div className="p-4 rounded-lg bg-white border">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-2">2</div>
                  <p className="font-medium">商品を登録（任意）</p>
                  <p className="text-base sm:text-sm text-gray-600">よく買う商品の価格を登録します（未登録店舗はここで入力しても登録可能）</p>
                </div>
                <div className="p-4 rounded-lg bg-white border">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-2">3</div>
                  <p className="font-medium">価格を比較</p>
                  <p className="text-base sm:text-sm text-gray-600">店頭で商品情報を入力して比較します（登録なしでもOK）</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto justify-center">
                  ダッシュボードへ戻る
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="card mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">概要</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-base sm:text-sm">
                <li>「今目の前の商品」と「いつものお店の最安商品」を比較し、お得か一目で判断</li>
                <li>単価（1単位あたりの価格）を自動計算</li>
                <li>複数店舗・商品を登録して管理可能</li>
                <li>店舗・商品登録は任意。登録すると履歴管理が便利、未登録でもその場入力で比較可能</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Screen structure */}
        <section className="card mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">画面構成</h2>
              <div className="space-y-3 text-base sm:text-sm text-gray-700">
                <p><strong>今目の前の商品</strong>: 種別・商品名・容量・入り数・価格を入力すると単価が自動計算</p>
                <p><strong>比較結果</strong>: 同じ種別の最安単価と比較し、差額と%でお得/割高を表示</p>
                <p><strong>いつものお店の価格</strong>: 複数の価格を追加/編集/削除可能。各行で単価が自動計算</p>
              </div>
            </div>
          </div>
        </section>

        {/* Calculation */}
        <section className="card mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">入力と計算</h2>
              <div className="space-y-2 text-base sm:text-sm text-gray-700">
                <p><strong>単価の計算式</strong>: 価格 ÷ (容量 × 入り数)</p>
                <p><strong>単位</strong>: 種別ごとに固定（例: ラップ=m, トイレットペーパー=ロール, お米=kg, 洗剤/シャンプー/牛乳/油=ml, パン=枚, 卵=個）</p>
                <p className="text-gray-600">容量や価格が0/未入力の場合は単価は計算されません</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison logic */}
        <section className="card mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">比較ロジック</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-base sm:text-sm">
                <li>同一種別の中で「最も安い単価」と比較</li>
                <li>今の単価が安ければ「お得」、高ければ「割高」</li>
                <li>差額（円/単位）と差分（%）を表示</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">よくある質問</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-white border">
              <p className="font-medium">Q. 価格は税込/税抜どちら？</p>
              <p className="text-base sm:text-sm text-gray-700">A. 入力した価格がそのまま使われます。運用ルールをチーム内で揃えてください。</p>
            </div>
            <div className="p-4 rounded-lg bg-white border">
              <p className="font-medium">Q. 単位が違う商品は比較できる？</p>
              <p className="text-base sm:text-sm text-gray-700">A. 種別ごとに単位が固定です。同じ種別内で比較してください。</p>
            </div>
            <div className="p-4 rounded-lg bg-white border">
              <p className="font-medium">Q. 店舗名や商品名は必須？</p>
              <p className="text-base sm:text-sm text-gray-700">A. 店舗名・商品名は任意です（メモ用途に便利）。</p>
            </div>
            <div className="p-4 rounded-lg bg-white border">
              <p className="font-medium">Q. データは保存される？</p>
              <p className="text-base sm:text-sm text-gray-700">A. はい。ログイン後、この端末に保存されます（サーバー同期は現在未対応）。</p>
            </div>
          </div>
        </section>

        {/* Troubleshooting & Requirements */}
        <section className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">トラブルシューティング / 動作要件</h2>
          <div className="grid gap-3 md:gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-white border">
              <p className="font-medium mb-2">トラブルシューティング</p>
              <ul className="list-disc pl-5 space-y-1 text-base sm:text-sm text-gray-700">
                <li>単価が出ない → 容量・価格の入力を確認</li>
                <li>比較が出ない → 同種別で単価計算済みの商品が必要</li>
                <li>小数表示 → 小数2桁で丸めて表示</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-white border">
              <p className="font-medium mb-2">動作要件</p>
              <ul className="list-disc pl-5 space-y-1 text-base sm:text-sm text-gray-700">
                <li>推奨ブラウザ: 最新版の Chrome / Edge / Safari</li>
                <li>ネット接続: 初回ログインに必要。ログイン済みならオフラインでも比較・ローカル保存が可能</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
