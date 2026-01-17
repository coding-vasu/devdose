-- Migration: Add category column to posts table
-- This migration adds support for content categorization

-- Add category column with CHECK constraint
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS category TEXT
CHECK (category IN ('Quick Tips', 'Common Mistakes', 'Did You Know', 'Quick Wins', 'Under the Hood'));

-- Create index on category for efficient filtering
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- Update existing posts with a default category (if any exist)
-- You may want to run the pipeline again to properly categorize existing posts
UPDATE posts
SET category = 'Quick Tips'
WHERE category IS NULL;

-- Make category NOT NULL after setting defaults
ALTER TABLE posts
ALTER COLUMN category SET NOT NULL;
