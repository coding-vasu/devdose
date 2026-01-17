-- Migration: Add code_hash column for duplicate prevention
-- Run this on existing database before deploying new publishing logic

-- Step 1: Add code_hash column (nullable initially)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS code_hash TEXT;

-- Step 2: Populate code_hash for existing posts
-- This computes MD5 hash of the code column
UPDATE posts 
SET code_hash = md5(code)
WHERE code_hash IS NULL;

-- Step 3: Identify and report duplicates
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) - COUNT(DISTINCT code_hash) INTO duplicate_count FROM posts;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE '⚠️  Found % duplicate posts based on code_hash', duplicate_count;
    RAISE NOTICE 'Duplicate posts will be removed (keeping oldest post for each code_hash)';
  ELSE
    RAISE NOTICE '✅ No duplicate posts found.';
  END IF;
END $$;

-- Step 4: Remove duplicates (keep oldest post for each code_hash)
-- This creates a temporary table with posts to keep, then deletes the rest
WITH posts_to_keep AS (
  SELECT DISTINCT ON (code_hash) id
  FROM posts
  ORDER BY code_hash, created_at ASC  -- Keep oldest post
)
DELETE FROM posts
WHERE id NOT IN (SELECT id FROM posts_to_keep);

-- Step 5: Make code_hash NOT NULL
ALTER TABLE posts ALTER COLUMN code_hash SET NOT NULL;

-- Step 6: Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_code_hash ON posts(code_hash);

-- Step 7: Verify migration
DO $$
DECLARE
  total_posts INTEGER;
  unique_hashes INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_posts FROM posts;
  SELECT COUNT(DISTINCT code_hash) INTO unique_hashes FROM posts;
  
  RAISE NOTICE '✅ Migration complete!';
  RAISE NOTICE 'Total posts: %', total_posts;
  RAISE NOTICE 'Unique code hashes: %', unique_hashes;
  
  IF total_posts = unique_hashes THEN
    RAISE NOTICE '✅ All posts have unique code hashes';
  ELSE
    RAISE WARNING 'Unexpected: post count does not match unique hash count';
  END IF;
END $$;
