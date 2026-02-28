-- 1. Create Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url text NOT NULL,
    title text,
    link text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Modify Discount Codes
ALTER TABLE public.discount_codes ADD COLUMN IF NOT EXISTS max_uses integer DEFAULT null;
ALTER TABLE public.discount_codes ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0;

-- 3. Row Level Security for Banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.banners FOR SELECT USING (true);
CREATE POLICY "Users can insert/update banners." ON public.banners FOR ALL USING (auth.role() = 'authenticated');

-- 4. Create Storage Bucket for Banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Banners bucket
CREATE POLICY "Public Read Banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Auth Insert Banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update Banners" ON storage.objects FOR UPDATE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');
