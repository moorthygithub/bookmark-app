-- Create the bookmarks table with enhanced production fields
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    favicon_url TEXT,
    preview_image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint for (user_id, url) to prevent duplicates per user
ALTER TABLE bookmarks ADD CONSTRAINT unique_user_url UNIQUE (user_id, url);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks (user_id);
CREATE INDEX IF NOT EXISTS bookmarks_created_at_idx ON bookmarks (created_at);
CREATE INDEX IF NOT EXISTS bookmarks_user_id_created_at_idx ON bookmarks (user_id, created_at);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their own active bookmarks
CREATE POLICY "Users can view their own bookmarks" 
ON bookmarks FOR SELECT 
USING (auth.uid() = user_id AND is_active = true);

-- Policy: Users can insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks" 
ON bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bookmarks
CREATE POLICY "Users can update their own bookmarks" 
ON bookmarks FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks" 
ON bookmarks FOR DELETE 
USING (auth.uid() = user_id);

-- Enable Realtime for the bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON bookmarks
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();

