const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupProductTypes() {
  try {
    console.log('🧹 Cleaning up product types to basic 4...\n')
    
    // Define the 4 basic types to keep
    const basicTypes = ['wrap', 'toilet_paper', 'tissue', 'detergent']
    
    console.log('📋 Basic types to keep:')
    basicTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type}`)
    })
    
    // 1. Get current product types
    console.log('\n1️⃣  Fetching current product types...')
    const { data: currentTypes, error: fetchError } = await supabase
      .from('product_types')
      .select('*')
      .order('created_at')
    
    if (fetchError) throw fetchError
    
    console.log(`✅ Found ${currentTypes.length} current product types`)
    
    // 2. Identify types to delete
    const typesToDelete = currentTypes.filter(pt => !basicTypes.includes(pt.value))
    const typesToKeep = currentTypes.filter(pt => basicTypes.includes(pt.value))
    
    console.log(`\n📊 Analysis:`)
    console.log(`   - Types to keep: ${typesToKeep.length}`)
    console.log(`   - Types to delete: ${typesToDelete.length}`)
    
    if (typesToDelete.length > 0) {
      console.log(`\n🗑️  Types to be deleted:`)
      typesToDelete.forEach(pt => {
        console.log(`   - ${pt.value}: ${pt.label}`)
      })
      
      // 3. Delete non-basic types
      console.log(`\n2️⃣  Deleting ${typesToDelete.length} non-basic product types...`)
      
      for (const typeToDelete of typesToDelete) {
        console.log(`   Deleting: ${typeToDelete.value} (${typeToDelete.label})`)
        
        const { error: deleteError } = await supabase
          .from('product_types')
          .delete()
          .eq('id', typeToDelete.id)
        
        if (deleteError) {
          console.error(`   ❌ Error deleting ${typeToDelete.value}:`, deleteError.message)
        } else {
          console.log(`   ✅ Deleted: ${typeToDelete.value}`)
        }
      }
    } else {
      console.log(`\n✅ No types to delete - already cleaned up!`)
    }
    
    // 4. Verify final state
    console.log(`\n3️⃣  Verifying final state...`)
    const { data: finalTypes, error: finalError } = await supabase
      .from('product_types')
      .select('*')
      .order('created_at')
    
    if (finalError) throw finalError
    
    console.log(`\n📋 Final product types (${finalTypes.length} total):`)
    finalTypes.forEach((pt, index) => {
      console.log(`   ${index + 1}. ${pt.value}: ${pt.label} (${pt.unit})`)
    })
    
    // Verify we have exactly the basic 4
    const hasAllBasic = basicTypes.every(basicType => 
      finalTypes.some(pt => pt.value === basicType)
    )
    
    const hasOnlyBasic = finalTypes.every(pt => 
      basicTypes.includes(pt.value)
    )
    
    console.log(`\n✅ Cleanup verification:`)
    console.log(`   - Has all basic 4 types: ${hasAllBasic ? '✅' : '❌'}`)
    console.log(`   - Has only basic 4 types: ${hasOnlyBasic ? '✅' : '❌'}`)
    console.log(`   - Final count: ${finalTypes.length} (should be 4)`)
    
    if (hasAllBasic && hasOnlyBasic && finalTypes.length === 4) {
      console.log(`\n🎉 Product types cleanup COMPLETED successfully!`)
      console.log(`🚀 Ready to implement user-specific product types!`)
    } else {
      console.log(`\n⚠️  Cleanup may not be complete. Please check manually.`)
    }
    
  } catch (error) {
    console.error('\n❌ Cleanup FAILED:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

cleanupProductTypes()