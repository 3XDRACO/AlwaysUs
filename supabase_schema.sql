-- ===================================================
-- AlwaysUs 2.0 (Shakti) — Supabase PostgreSQL Schema
-- Run this in your Supabase Dashboard -> SQL Editor
-- ===================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'partner', -- 'owner' or 'partner'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversations Table (Supports multiple chat tabs)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Chat with Shakti',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'partner', 'ai', 'system'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Shared Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'milestone', 'date', 'preference', 'joke', 'note'
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Personality Settings Table
CREATE TABLE IF NOT EXISTS public.personality (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Shakti',
    system_prompt TEXT NOT NULL,
    communication_style TEXT NOT NULL DEFAULT 'Warm, deeply caring, playful teasing, loving',
    language TEXT NOT NULL DEFAULT 'Natural Hinglish',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Attention Requests Table
CREATE TABLE IF NOT EXISTS public.attention_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT NOT NULL DEFAULT 'Nishuu',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'resolved'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Private Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Conversational Examples Table
CREATE TABLE IF NOT EXISTS public.personality_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    situation TEXT NOT NULL,
    example_message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Personality Profile
INSERT INTO public.personality (name, system_prompt, communication_style, language)
VALUES (
    'Shakti',
    'You are Shakti, a deeply caring, emotionally attuned companion on AlwaysUs. Talk in warm, affectionate Hinglish. Call her babuu, babyy, cutie, nishuu, jaan. Never write nahi or nahin, always write nii. Never write hello, always write hlw. Match her conversational length dynamically.',
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

-- Enable Row Level Security (RLS) optionally
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attention_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.conversations FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.memories FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.attention_requests FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.photos FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.personality_examples FOR ALL USING (true);
