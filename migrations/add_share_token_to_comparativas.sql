-- Migration: Add share_token column to comparativas table
-- This allows secure sharing of comparativas without exposing the numeric ID

-- Add share_token column (nullable for existing records)
ALTER TABLE public.comparativas 
ADD COLUMN IF NOT EXISTS share_token character varying(40) NULL;

-- Create unique index on share_token for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS comparativas_share_token_idx 
ON public.comparativas(share_token) 
WHERE share_token IS NOT NULL;

-- Optional: Generate tokens for existing comparativas
-- Uncomment and run this if you want to populate tokens for existing records
-- UPDATE public.comparativas 
-- SET share_token = encode(gen_random_bytes(24), 'base64')
-- WHERE share_token IS NULL;

-- Note: After populating tokens for all existing records, you can make it NOT NULL:
-- ALTER TABLE public.comparativas 
-- ALTER COLUMN share_token SET NOT NULL;
