const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function debugProductTypes() {
  try {
    console.log('🔍 Debugging product types issue...\n')
    
    // Check database connection
    console.log('1️⃣  Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('product_types')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Database connection error:', testError.message)
      return
    }
    
    console.log('✅ Database connection working')
    
    // Get all product types
    console.log('\n2️⃣  Fetching all product types...')
    const { data: allTypes, error: fetchError } = await supabase
      .from('product_types')
      .select('*')
      .order('created_at')
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError.message)
      return
    }
    
    console.log(`✅ Found ${allTypes.length} product types:`)
    if (allTypes.length === 0) {
      console.log('⚠️  No product types found! This could be the issue.')
      return
    }
    
    allTypes.forEach((pt, index) => {
      console.log(`   ${index + 1}. ${pt.value} | ${pt.label} | ${pt.unit} | ID: ${pt.id}`)
    })
    
    // Check for basic 4 types
    console.log('\n3️⃣  Checking for basic 4 types...')
    const basicTypes = ['wrap', 'toilet_paper', 'tissue', 'detergent']
    const missingBasicTypes = []
    
    basicTypes.forEach(basicType => {
      const found = allTypes.find(pt => pt.value === basicType)
      if (found) {
        console.log(`   ✅ ${basicType}: ${found.label}`)
      } else {
        console.log(`   ❌ ${basicType}: MISSING`)
        missingBasicTypes.push(basicType)
      }
    })
    
    if (missingBasicTypes.length > 0) {
      console.log('\n🚨 Missing basic types detected! Recreating them...')
      
      const basicTypesData = [
        { value: 'wrap', label: 'ラップ', unit: 'm' },
        { value: 'toilet_paper', label: 'トイレットペーパー', unit: 'ロール' },
        { value: 'tissue', label: 'ティッシュペーパー', unit: '箱' },
        { value: 'detergent', label: '洗剤', unit: 'ml' }
      ]
      
      for (const basicType of basicTypesData) {
        if (missingBasicTypes.includes(basicType.value)) {
          console.log(`   Creating: ${basicType.value}`)
          const { error: insertError } = await supabase
            .from('product_types')
            .insert(basicType)
          
          if (insertError) {
            console.error(`   ❌ Error creating ${basicType.value}:`, insertError.message)
          } else {
            console.log(`   ✅ Created: ${basicType.value}`)
          }
        }
      }
      
      console.log('\n✅ Basic types recreation completed!')
    }
    
    // Final verification
    console.log('\n4️⃣  Final verification...')
    const { data: finalTypes, error: finalError } = await supabase
      .from('product_types')
      .select('*')
      .order('created_at')
    
    if (finalError) {
      console.error('❌ Final verification error:', finalError.message)
      return
    }
    
    console.log(`✅ Final count: ${finalTypes.length} product types`)
    console.log('\n📋 Current product types:')
    finalTypes.forEach((pt, index) => {
      console.log(`   ${index + 1}. ${pt.label} (${pt.value})`)
    })
    
    if (finalTypes.length >= 4) {
      console.log('\n🎉 Product types are now available!')
      console.log('The frontend should now be able to load product types.')
    }
    
  } catch (error) {
    console.error('\n❌ Debug failed:', error.message)
  }
}

debugProductTypes()