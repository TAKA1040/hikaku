-- Migration to add allowed_units column to product_types table
-- This enables dynamic unit management for each product type

-- Add allowed_units column as JSONB array to store multiple allowed units
DO $$ 
BEGIN
    -- Add allowed_units column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'product_types' 
                   AND column_name = 'allowed_units') THEN
        ALTER TABLE public.product_types 
        ADD COLUMN allowed_units jsonb NOT NULL DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Added allowed_units column to product_types table';
    END IF;
END $$;

-- Update existing product types with allowed_units based on current frontend logic
UPDATE public.product_types SET allowed_units = 
    CASE 
        WHEN value = 'toilet_paper' THEN '["m", "cm", "ロール", "個"]'::jsonb
        WHEN value = 'wrap' THEN '["m", "cm", "個"]'::jsonb
        WHEN value = 'tissue' THEN '["箱", "個"]'::jsonb
        WHEN value = 'detergent' THEN '["ml", "L", "g", "kg"]'::jsonb
        WHEN value = 'shampoo' THEN '["ml", "L"]'::jsonb
        WHEN value = 'rice' THEN '["kg", "g"]'::jsonb
        WHEN value = 'oil' THEN '["ml", "L"]'::jsonb
        WHEN value = 'milk' THEN '["ml", "L"]'::jsonb
        WHEN value = 'bread' THEN '["枚", "個", "g", "kg"]'::jsonb
        WHEN value = 'eggs' THEN '["個", "kg", "g"]'::jsonb
        ELSE '["個"]'::jsonb -- Default fallback
    END
WHERE allowed_units = '[]'::jsonb;

-- Add default_unit column for better unit management
DO $$ 
BEGIN
    -- Add default_unit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'product_types' 
                   AND column_name = 'default_unit') THEN
        ALTER TABLE public.product_types 
        ADD COLUMN default_unit text;
        
        RAISE NOTICE 'Added default_unit column to product_types table';
    END IF;
END $$;

-- Set default_unit based on current unit values
UPDATE public.product_types SET default_unit = 
    CASE 
        WHEN value = 'toilet_paper' THEN 'm'
        WHEN value = 'wrap' THEN 'm'
        WHEN value = 'tissue' THEN '箱'
        WHEN value = 'detergent' THEN 'ml'
        WHEN value = 'shampoo' THEN 'ml'
        WHEN value = 'rice' THEN 'kg'
        WHEN value = 'oil' THEN 'ml'
        WHEN value = 'milk' THEN 'ml'
        WHEN value = 'bread' THEN '枚'
        WHEN value = 'eggs' THEN '個'
        ELSE unit -- Use existing unit as default
    END
WHERE default_unit IS NULL;

-- Make default_unit NOT NULL after setting values
ALTER TABLE public.product_types ALTER COLUMN default_unit SET NOT NULL;

-- Add user_id column for user-specific product types (optional for future expansion)
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist (nullable for global types)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'product_types' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE public.product_types 
        ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added user_id column to product_types table for user-specific types';
    END IF;
END $$;

-- Update RLS policy to allow users to manage their own product types
DROP POLICY IF EXISTS "Anyone can read product types" ON public.product_types;

-- New policies for product_types with user-specific support
CREATE POLICY "Users can read all global and own product types" ON public.product_types
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (user_id IS NULL OR auth.uid() = user_id)
    );

CREATE POLICY "Users can insert own product types" ON public.product_types
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product types" ON public.product_types
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own product types" ON public.product_types
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_types_user_id ON public.product_types(user_id);
CREATE INDEX IF NOT EXISTS idx_product_types_value_user_id ON public.product_types(value, user_id);

-- Add constraints to ensure data quality
ALTER TABLE public.product_types 
    ADD CONSTRAINT check_allowed_units_array 
    CHECK (jsonb_typeof(allowed_units) = 'array');

ALTER TABLE public.product_types 
    ADD CONSTRAINT check_default_unit_in_allowed 
    CHECK (allowed_units ? default_unit);

COMMENT ON COLUMN public.product_types.allowed_units IS 'JSON array of allowed units for this product type';
COMMENT ON COLUMN public.product_types.default_unit IS 'Default unit to use when creating products of this type';
COMMENT ON COLUMN public.product_types.user_id IS 'User ID for custom product types, NULL for global types';