-- Migration to fix database schema for Hikaku price comparison app

-- First, check if tables exist, if not create them
DO $$ 
BEGIN
    -- Create product_types table if not exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_types') THEN
        CREATE TABLE public.product_types (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            value text UNIQUE NOT NULL,
            label text NOT NULL,
            unit text NOT NULL,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Insert default product types
        INSERT INTO public.product_types (value, label, unit) VALUES
            ('wrap', 'ラップ', 'm'),
            ('toilet_paper', 'トイレットペーパー', 'ロール'),
            ('tissue', 'ティッシュペーパー', '箱'),
            ('detergent', '洗剤', 'ml'),
            ('shampoo', 'シャンプー', 'ml'),
            ('rice', 'お米', 'kg'),
            ('oil', '食用油', 'ml'),
            ('milk', '牛乳', 'ml'),
            ('bread', 'パン', '枚'),
            ('eggs', '卵', '個');
    END IF;

    -- Create stores table if not exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stores') THEN
        CREATE TABLE public.stores (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            name text NOT NULL,
            location text,
            notes text,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(user_id, name)
        );
    END IF;

    -- Create products table if not exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        CREATE TABLE public.products (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
            product_type text REFERENCES public.product_types(value) NOT NULL,
            name text,
            quantity numeric NOT NULL CHECK (quantity > 0),
            unit text NOT NULL DEFAULT 'm',
            count numeric NOT NULL DEFAULT 1 CHECK (count > 0),
            price numeric NOT NULL CHECK (price > 0),
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- Add unit column to products table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'unit') THEN
        ALTER TABLE public.products ADD COLUMN unit text NOT NULL DEFAULT 'm';
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can manage own products" ON public.products;
DROP POLICY IF EXISTS "Anyone can read product types" ON public.product_types;

-- Stores policies
CREATE POLICY "Users can manage own stores" ON public.stores
    FOR ALL USING (auth.uid() = user_id);

-- Products policies  
CREATE POLICY "Users can manage own products" ON public.products
    FOR ALL USING (auth.uid() = user_id);

-- Product types are readable by all authenticated users
CREATE POLICY "Anyone can read product types" ON public.product_types
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(product_type);