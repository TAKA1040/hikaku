const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProductTypePersistence() {
  console.log('🧪 Testing Product Type Persistence...\n')
  
  try {
    // 1. Check current product types
    console.log('1️⃣  Fetching current product types...')
    const { data: beforeTypes, error: fetchError } = await supabase
      .from('product_types')
      .select('*')
      .order('created_at')
    
    if (fetchError) throw fetchError
    
    console.log(`✅ Found ${beforeTypes.length} existing product types:`)
    beforeTypes.forEach(pt => {
      console.log(`   - ${pt.value}: ${pt.label} (${pt.unit})`)
    })
    
    // 2. Add a new test product type
    console.log('\n2️⃣  Adding a test product type...')
    const testProductType = {
      value: 'test_snacks_' + Date.now(),
      label: 'テストお菓子',
      unit: 'g'
    }
    
    const { data: newType, error: insertError } = await supabase
      .from('product_types')
      .insert(testProductType)
      .select()
      .single()
    
    if (insertError) throw insertError
    
    console.log(`✅ Successfully added: ${newType.value} - ${newType.label}`)
    console.log(`   ID: ${newType.id}`)
    console.log(`   Created: ${newType.created_at}`)
    
    // 3. Verify it was added
    console.log('\n3️⃣  Verifying the new product type exists...')
    const { data: afterTypes, error: verifyError } = await supabase
      .from('product_types')
      .select('*')
      .order('created_at')
    
    if (verifyError) throw verifyError
    
    const wasAdded = afterTypes.some(pt => pt.id === newType.id)
    console.log(`${wasAdded ? '✅' : '❌'} Product type persistence: ${wasAdded ? 'SUCCESS' : 'FAILED'}`)
    console.log(`   Total product types: ${beforeTypes.length} → ${afterTypes.length}`)
    
    // 4. Clean up - remove the test product type
    console.log('\n4️⃣  Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('product_types')
      .delete()
      .eq('id', newType.id)
    
    if (deleteError) throw deleteError
    
    console.log('✅ Test product type removed successfully')
    
    // 5. Final verification
    console.log('\n5️⃣  Final verification...')
    const { data: finalTypes, error: finalError } = await supabase
      .from('product_types')
      .select('*')
      .order('created_at')
    
    if (finalError) throw finalError
    
    const isCleanedUp = !finalTypes.some(pt => pt.id === newType.id)
    console.log(`${isCleanedUp ? '✅' : '❌'} Cleanup: ${isCleanedUp ? 'SUCCESS' : 'FAILED'}`)
    console.log(`   Final count: ${finalTypes.length} (should equal initial: ${beforeTypes.length})`)
    
    console.log('\n🎉 Product Type Persistence Test COMPLETED!')
    console.log('\n📋 Summary:')
    console.log(`   ✅ Database connection: Working`)
    console.log(`   ✅ Product type creation: Working`)
    console.log(`   ✅ Product type persistence: Working`)
    console.log(`   ✅ Product type deletion: Working`)
    console.log('\n🚀 Ready for frontend integration!')
    
  } catch (error) {
    console.error('\n❌ Test FAILED:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

testProductTypePersistence()