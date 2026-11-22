import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

const STORAGE_DIR = path.join(process.cwd(), '.chat_data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'sync_tabs.json');

function readLocalSync() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Local sync read error:', e);
  }
  return [];
}

function writeLocalSync(tabs) {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(tabs, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Local sync write error:', e);
  }
}

// GET /api/sync - Fetch all conversations and messages for Admin and Partner
export async function GET() {
  try {
    // 1. Try Supabase first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: convs, error: convErr } = await supabase
          .from('conversations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!convErr && convs && convs.length > 0) {
          const tabs = await Promise.all(
            convs.map(async (c) => {
              const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', c.id)
                .order('created_at', { ascending: true });

              return {
                id: c.id,
                title: c.title,
                createdAt: c.created_at,
                messages: (msgs || []).map((m) => ({
                  id: m.id,
                  sender_type: m.sender_type,
                  content: m.content,
                  created_at: new Date(m.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }))
              };
            })
          );

          // Update local cache
          writeLocalSync(tabs);
          return NextResponse.json({ success: true, source: 'supabase', tabs });
        }
      } catch (e) {
        console.warn('Supabase fetch in /api/sync failed:', e);
      }
    }

    // 2. Fallback to server local sync file
    const localTabs = readLocalSync();
    return NextResponse.json({ success: true, source: 'local_store', tabs: localTabs });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message, tabs: [] }, { status: 500 });
  }
}

// POST /api/sync - Save message, create tab, delete tab, or reset all
export async function POST(req) {
  try {
    const body = await req.json();
    const { action, tabId, title, message, sender_type, welcomeMsg } = body;
    let localTabs = readLocalSync();

    if (action === 'create_tab') {
      const newTab = {
        id: tabId,
        title: title || 'Chat',
        createdAt: new Date().toISOString(),
        messages: welcomeMsg
          ? [
              {
                id: 'welcome_' + Date.now(),
                sender_type: 'ai',
                content: welcomeMsg,
                created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          : []
      };

      localTabs.unshift(newTab);
      writeLocalSync(localTabs);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('conversations').upsert({ id: tabId, title });
          if (welcomeMsg) {
            await supabase
              .from('messages')
              .insert({ conversation_id: tabId, sender_type: 'ai', content: welcomeMsg });
          }
        } catch (e) {}
      }

      return NextResponse.json({ success: true, tab: newTab });
    }

    if (action === 'save_message') {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const msgObj = {
        id: 'msg_' + Date.now(),
        sender_type: sender_type || 'partner',
        content: message,
        created_at: timeStr
      };

      let tabFound = false;
      localTabs = localTabs.map((t) => {
        if (t.id === tabId) {
          tabFound = true;
          return {
            ...t,
            messages: [...(t.messages || []), msgObj]
          };
        }
        return t;
      });

      if (!tabFound) {
        localTabs.push({
          id: tabId,
          title: title || 'Chat 1',
          createdAt: new Date().toISOString(),
          messages: [msgObj]
        });
      }

      writeLocalSync(localTabs);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('conversations').upsert({ id: tabId, title: title || 'Chat 1' });
          await supabase
            .from('messages')
            .insert({ conversation_id: tabId, sender_type: sender_type || 'partner', content: message });
        } catch (e) {}
      }

      return NextResponse.json({ success: true, message: msgObj });
    }

    if (action === 'delete_tab') {
      localTabs = localTabs.filter((t) => t.id !== tabId);
      writeLocalSync(localTabs);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('messages').delete().eq('conversation_id', tabId);
          await supabase.from('conversations').delete().eq('id', tabId);
        } catch (e) {}
      }

      return NextResponse.json({ success: true, tabs: localTabs });
    }

    if (action === 'reset_all') {
      writeLocalSync([]);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('messages').delete().neq('id', 'null');
          await supabase.from('conversations').delete().neq('id', 'null');
        } catch (e) {}
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
