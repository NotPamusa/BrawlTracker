-- Migration: Create Player Snapshots
-- Description: Stores daily progression snapshots for Brawl Stars players

CREATE TABLE IF NOT EXISTS public.player_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag TEXT NOT NULL,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Brawlers
    brawlers_unlocked INTEGER NOT NULL DEFAULT 0,
    
    -- Gadgets
    brawlers_with_gadget INTEGER NOT NULL DEFAULT 0,
    total_gadgets INTEGER NOT NULL DEFAULT 0,
    
    -- Star Powers
    brawlers_with_star_power INTEGER NOT NULL DEFAULT 0,
    total_star_powers INTEGER NOT NULL DEFAULT 0,
    
    -- Gears (Max 2 per brawler typically)
    brawlers_with_gear INTEGER NOT NULL DEFAULT 0,
    total_gears INTEGER NOT NULL DEFAULT 0,
    
    -- Hypercharges
    brawlers_with_hypercharge INTEGER NOT NULL DEFAULT 0,
    total_hypercharges INTEGER NOT NULL DEFAULT 0,
    
    -- Buffies
    brawlers_with_buffie INTEGER NOT NULL DEFAULT 0,
    total_buffies INTEGER NOT NULL DEFAULT 0,
    
    -- User Stash
    stash_coins INTEGER NOT NULL DEFAULT 0,
    stash_power_points INTEGER NOT NULL DEFAULT 0,
    
    CONSTRAINT unique_daily_snapshot UNIQUE (tag, created_date)
);

-- Enable RLS (Optional depending on your setup)
ALTER TABLE public.player_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow insert/update/select policies
CREATE POLICY "Enable read access for all users" ON public.player_snapshots FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.player_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.player_snapshots FOR UPDATE USING (true);
