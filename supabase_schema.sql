-- ===================================================
-- AlwaysUs 2.0 (Shakti) — Supabase PostgreSQL Schema
-- Run this in your Supabase Dashboard -> SQL Editor
-- ===================================================

-- 1. Conversations Table (Supports multiple chat tabs)
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL DEFAULT 'Chat with Shakti',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'partner', 'ai', 'system'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Shared Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category TEXT NOT NULL, -- 'milestone', 'date', 'preference', 'joke', 'note'
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attention Requests Table
CREATE TABLE IF NOT EXISTS public.attention_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_name TEXT NOT NULL DEFAULT 'Nishuu',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'resolved'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Private Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Personality Settings Table
CREATE TABLE IF NOT EXISTS public.personality (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL DEFAULT 'Shakti',
    system_prompt TEXT NOT NULL,
    communication_style TEXT NOT NULL DEFAULT 'Warm, deeply caring, playful teasing, loving',
    language TEXT NOT NULL DEFAULT 'Natural Hinglish',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Conversational Examples Table
CREATE TABLE IF NOT EXISTS public.personality_examples (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category TEXT NOT NULL,
    situation TEXT NOT NULL,
    example_message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Personality Profile
INSERT INTO public.personality (name, system_prompt, communication_style, language)
VALUES (
    'Shakti',
    'You are Shakti, a deeply caring, emotionally attuned companion on AlwaysUs. Talk in warm, affectionate Hinglish. Call her babuu, babyy, cutie, nishuu, jaan. Never write nahi or nahin, always write nii. Never write hello, always write hlw. Be romantically playful, naughty, and show cute roothna/gussa when ignored.',
    'Warm, deeply caring, playful teasing, loving',
    'Natural Hinglish'
) ON CONFLICT DO NOTHING;

-- Seed Approved Real-Life Memories
INSERT INTO public.memories (category, content, approved) VALUES
('date', 'Nishuu birthday on 19 Jan', true),
('date', 'Shakti birthday on 05 Dec', true),
('date', 'Relationship Anniversary on 10 Oct', true),
('milestone', 'Proposal date: 10 Oct 2024. Nishuu ne propose kiya tha agle hi din! Hum Free Fire Max game me mile the aur usne Abhi naam ke dost se mera Instagram handle liya tha, fir baat start hui.', true)
ON CONFLICT DO NOTHING;

-- Disable RLS to allow direct seamless sync between Partner and Admin
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attention_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_examples DISABLE ROW LEVEL SECURITY;

-- Grant permissions to public roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
