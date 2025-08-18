const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking current product_types table...')
    
    // Check current product types data
    const { data: productTypes, error: dataError } = await supabase
      .from('product_types')
      .select('*')
      .limit(5)
    
    if (dataError) {
      console.error('❌ Error fetching product types:', dataError.message)
      console.log('This might mean the table does not exist yet.')
      console.log('🚀 Ready to run initial migration!')
      return
    }
    
    console.log(`✅ Found ${productTypes?.length || 0} product types in database`)
    if (productTypes && productTypes.length > 0) {
      console.log('Sample data:')
      productTypes.slice(0, 3).forEach(pt => {
        console.log(`  - ${pt.value}: ${pt.label}`)
        console.log(`    Current columns:`, Object.keys(pt))
      })
      
      // Check if new columns exist by looking at first record
      const sample = productTypes[0]
      const hasAllowedUnits = sample.hasOwnProperty('allowed_units')
      const hasDefaultUnit = sample.hasOwnProperty('default_unit')
      const hasUserId = sample.hasOwnProperty('user_id')
      
      console.log(`\n📋 Migration status:`)
      console.log(`  - allowed_units column: ${hasAllowedUnits ? '✅ exists' : '❌ missing'}`)
      console.log(`  - default_unit column: ${hasDefaultUnit ? '✅ exists' : '❌ missing'}`)
      console.log(`  - user_id column: ${hasUserId ? '✅ exists' : '❌ missing'}`)
      
      if (!hasAllowedUnits || !hasDefaultUnit || !hasUserId) {
        console.log('\n🚀 Ready to run migration!')
      } else {
        console.log('\n✅ Migration appears to already be applied')
      }
    } else {
      console.log('\n🚀 Table exists but is empty. Ready to run migration!')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkDatabaseSchema()