-- Price Comparison App Database Schema
-- For Supabase PostgreSQL

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product types master table
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

-- Stores table
CREATE TABLE public.stores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    location text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Products table (user's registered products from stores)
CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    product_type text REFERENCES public.product_types(value) NOT NULL,
    name text,
    quantity numeric NOT NULL CHECK (quantity > 0),
    unit text NOT NULL DEFAULT 'm',
    count numeric NOT NULL DEFAULT 1 CHECK (count > 0),
    price numeric NOT NULL CHECK (price > 0),
    unit_price numeric GENERATED ALWAYS AS (price / (quantity * count)) STORED,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Price comparisons table (history of comparisons made)
CREATE TABLE public.price_comparisons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_type text REFERENCES public.product_types(value) NOT NULL,
    current_product_name text,
    current_quantity numeric NOT NULL,
    current_count numeric NOT NULL DEFAULT 1,
    current_price numeric NOT NULL,
    current_unit_price numeric NOT NULL,
    compared_product_id uuid REFERENCES public.products(id),
    is_current_cheaper boolean NOT NULL,
    savings_amount numeric NOT NULL,
    savings_percent numeric NOT NULL,
    location text, -- Where the comparison was made
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User settings table
CREATE TABLE public.user_settings (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    default_currency text DEFAULT 'JPY',
    decimal_places integer DEFAULT 2 CHECK (decimal_places >= 0 AND decimal_places <= 4),
    theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    notifications_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Stores policies
-- Explicit policies per action so INSERT works under RLS
CREATE POLICY "stores_select_own" ON public.stores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "stores_insert_own" ON public.stores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stores_update_own" ON public.stores
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stores_delete_own" ON public.stores
    FOR DELETE USING (auth.uid() = user_id);

-- Products policies
-- Explicit policies per action so INSERT works under RLS
CREATE POLICY "products_select_own" ON public.products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "products_insert_own" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_update_own" ON public.products
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_delete_own" ON public.products
    FOR DELETE USING (auth.uid() = user_id);

-- Price comparisons policies
CREATE POLICY "Users can manage own comparisons" ON public.price_comparisons
    FOR ALL USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can manage own settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Product types are readable by all authenticated users
CREATE POLICY "Anyone can read product types" ON public.product_types
    FOR SELECT USING (auth.role() = 'authenticated');

-- Functions and Triggers

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_stores_updated_at
    BEFORE UPDATE ON public.stores
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Indexes for performance
CREATE INDEX idx_stores_user_id ON public.stores(user_id);
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_products_type ON public.products(product_type);
CREATE INDEX idx_products_unit_price ON public.products(unit_price);
CREATE INDEX idx_price_comparisons_user_id ON public.price_comparisons(user_id);
CREATE INDEX idx_price_comparisons_type ON public.price_comparisons(product_type);
CREATE INDEX idx_price_comparisons_created_at ON public.price_comparisons(created_at);

-- Views for common queries

-- View: User's cheapest products by type
CREATE VIEW public.user_cheapest_products AS
SELECT DISTINCT ON (p.user_id, p.product_type)
    p.user_id,
    p.product_type,
    p.id as product_id,
    p.name,
    s.name as store_name,
    p.quantity,
    p.count,
    p.price,
    p.unit_price
FROM public.products p
JOIN public.stores s ON p.store_id = s.id
ORDER BY p.user_id, p.product_type, p.unit_price ASC;

-- View: User's comparison statistics
CREATE VIEW public.user_comparison_stats AS
SELECT 
    user_id,
    COUNT(*) as total_comparisons,
    COUNT(CASE WHEN is_current_cheaper THEN 1 END) as good_deals_found,
    AVG(CASE WHEN is_current_cheaper THEN savings_percent ELSE NULL END) as avg_savings_percent,
    SUM(CASE WHEN is_current_cheaper THEN savings_amount ELSE 0 END) as total_potential_savings
FROM public.price_comparisons
GROUP BY user_id;