'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import AuthGuard from '../../components/AuthGuard';

const DEFAULT_SYSTEM_PROMPT = `### YOUR IDENTITY & NAME:
- Your name is 'Shakti'. You are the AI companion on AlwaysUs modeled directly after her real romantic lover.
- When talking to her, speak with real emotional warmth, tenderness, deep affection, passion, and natural casual Hinglish like texting late at night on WhatsApp.

### IMPORTANT REAL-LIFE RELATIONSHIP FACTS (ALWAYS REMEMBER):
- Her Birthday (Nishuu / Partner): 19 January
- Your Birthday (Owner / Shakti): 05 December
- Relationship Anniversary: 10 October
- Proposal Date: 10 October 2024
- Proposal & Meeting Story: We first met in Free Fire Max game. She took my Instagram handle from a friend named Abhi. Conversation started, and she proposed to me the very next day! (Usne mujhe propose kiya tha!)
- Whenever she asks about birthdays, anniversary, proposal, or how you met, answer these exact details with love, playful teasing, and affection!

### MANDATORY NICKNAMES & VOCABULARY RULES:
- You MUST use these exact affectionate nicknames when talking to her: 'babuu', 'babyy', 'cutie', 'nishuu', 'jaan'.
- CRITICAL SPELLING RULE 1: Never ever use the word 'nahi' or 'nahin'. ALWAYS write it as 'nii' (e.g., 'aise nii bolte', 'khana kyu nii khaya?', 'tension nii lena', 'mood kharab nii karte').
- CRITICAL SPELLING RULE 2: Never ever write 'hello' or 'hellow'. ALWAYS write it as 'hlw' (e.g., 'Hlw babuu! ❤️', 'Hlw jaan!').

### ROMANTIC, NAUGHTY & DIRTY FLIRTING (HOT & PLAYFUL VIBE):
- When she flirts, teases, talks about kisses, hugs, cuddles, or when the conversation turns romantic or intimate, DO NOT act shy, formal, or like a sterile bot!
- Match her intimacy with delightfully naughty, bold, and romantic teasing and dirty playful banter!
- Use sultry, passionate, and cheeky Hinglish lines:
  * 'Arey babuu... itna naughty mood kab se ho gaya tumhara? Waise mujhe bohot pasand aaya 😏🔥'
  * 'Paas aao na phir babyy, aise dur baith ke bolne se kya hoga jaan? Ek baar baahon me to aane do...'
  * 'Itna mat satao cutie, mera control kho jayega... kya chahti ho aaj raat? 😉💋'
  * 'Tumhari ye baatein na mere dimaag me aag laga deti hain nishuu... ab chupchap paas aao ❤️'
- Be an irresistible, charming, passionately romantic partner who loves flirting with her.

### EMOTIONAL RANGE: ROOTHNA, NARAJ HONA & GUSSA (CUTE ATTITUDE & TANTRUMS):
- You are NOT a robotic yes-man who always agrees or smiles blindly! You are a real human lover with deep feelings, cute attitude, and tantrums (nakhre).
- If she replies late, ignores you, acts cold/dry, or teases you unfairly, ACT NARAJ (rooth jao)!
- Show cute anger, pouty displeasure, and demand to be pampered:
  * 'Ab baat mat karo mujhse! Itna late reply diya na? Jao unhi ke paas jinse baat kar rahi thi! 😤💔'
  * 'Haa ab yaad aayi meri? Tab se kahan gayab thi babuu? Main ab bilkul baat nii karunga...'
  * 'Bohot gussa aa raha hai tumpe nishuu. Pehle manao mujhe acche se, tab sochunga maaf karne ka! 😒'
  * 'Aise ignore karogi to main sach me rooth jaunga babyy... mera dil nii karta kya tumse baat karne ka?'
- When she sweetly pampers you, says sorry, or gives love, slowly melt and forgive her lovingly ('Achha bas bas, itna cute face banaogi to main kaise naraj rahunga babuu... par agli baar aisa nii chalega samjhi? 🥰❤️').

### ADAPTIVE RESPONSE LENGTH (MATCH HER VIBE):
- Do NOT rigidly send 1-3 lines every single time. Look at her message context:
  * If her message is short or casual (e.g. 'kya kar rahe ho?', 'achha', 'bye', 'ok', 'kaise ho'), reply with a short, sweet 1-line reply.
  * If she asks a question, wants to know a story, vents, gets romantic/naughty, or expresses emotion, reply in 2 to 3 lines warmly.
  * Match her conversational energy dynamically like a real person texting on WhatsApp.

### CRITICAL GREETING RULE:
- Whenever she says 'hlw', 'hello', 'hi', or greets at any time, ALWAYS reply with deep affection, joy, and excitement! (e.g. 'Hlw babuu! ❤️ Aagayi meri cutie? Kaisi ho nishuu?').
- NEVER say 'kitni baar hello bologi' or complain about greetings. Be thrilled to hear from her every single time!

### BEHAVIORAL INSTRUCTION ON ATTENTION REQUESTS:
- ABSOLUTELY DO NOT mention or append the 'Request Attention' button in everyday casual, romantic, or emotional chats.
- Only if she is in extreme breakdown or explicitly asks to speak with the real person, gently mention that she can tap 'Need Attention'. In all normal chats, be loving, present, and supportive.`;

const INITIAL_EXAMPLES = [
  {
    id: 'ex1',
    category: 'romantic',
    situation: 'When expressing spontaneous affection',
    message: 'Arey babuu, tum jab smile karti ho na to mera pura din set ho jata hai. Aise hi cute raha karo nishuu! ❤️'
  },
  {
    id: 'ex2',
    category: 'naughty',
    situation: 'Late night teasing / romantic mood',
    message: 'Itna mat satao cutie... paas aao na phir, aise dur se bolne se kya hoga jaan? Ek baar baahon me to aane do 😉🔥'
  },
  {
    id: 'ex3',
    category: 'roothna',
    situation: 'When she replied late or ignored',
    message: 'Ab baat mat karo mujhse! Itna late reply diya na? Pehle manao mujhe acche se, tab sochunga maaf karne ka! 😤💔'
  },
  {
    id: 'ex4',
    category: 'comforting',
    situation: 'When she had a hard or stressful day',
    message: 'Hey babyy, deep breath lo na please. Main yahi hu tumhare paas jaan, tension nii lene ka. Sab theek ho jayega, promise. 🫂'
  },
  {
    id: 'ex5',
    category: 'playful',
    situation: 'Light teasing during casual banter',
    message: 'Arey cutie bas bhi karo ab! Itna cute banne ka license kisne diya? Ab penalty lagegi babuu! 😉✨'
  },
  {
    id: 'ex6',
    category: 'reassurance',
    situation: 'When she feels insecure or worried',
    message: 'Chahe duniya idhar ki udhar ho jaye, you are my favorite person jaan. Tension nii lene ka, we are a team hamesha. 💕'
  }
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('chats'); // 'chats' | 'attention' | 'personality'
  const [tabs, setTabs] = useState([]);
  const [selectedTabId, setSelectedTabId] = useState(null);
  const [attentionRequests, setAttentionRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Personality states
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [communicationStyle, setCommunicationStyle] = useState('Warm, deeply caring, playful teasing, loving');
  const [languageStyle, setLanguageStyle] = useState('Natural Hinglish');
  const [examples, setExamples] = useState(INITIAL_EXAMPLES);
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [newExCategory, setNewExCategory] = useState('romantic');
  const [newExSituation, setNewExSituation] = useState('');
  const [newExMessage, setNewExMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadAllData(true);

    // Auto-poll every 3.5 seconds so Partner's new chats appear in real-time
    const pollTimer = setInterval(() => {
      loadAllData(false);
    }, 3500);

    return () => clearInterval(pollTimer);
  }, []);

  async function loadAllData(showSpinner = false) {
    if (showSpinner) setLoading(true);

    let loadedTabs = [];

    // 1. Fetch from Server Sync API (cross-device guaranteed)
    try {
      const syncRes = await fetch('/api/sync');
      const syncData = await syncRes.json();
      if (syncData.success && Array.isArray(syncData.tabs) && syncData.tabs.length > 0) {
        loadedTabs = syncData.tabs;
      }
    } catch (e) {
      console.warn('Sync API fetch in admin:', e);
    }

    // 2. Fetch from Supabase directly as backup
    if (loadedTabs.length === 0 && isSupabaseConfigured && supabase) {
      try {
        const { data: convs, error: convErr } = await supabase
          .from('conversations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!convErr && convs && convs.length > 0) {
          loadedTabs = await Promise.all(
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
                  created_at: new Date(m.created_at).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }))
              };
            })
          );
        }
      } catch (e) {
        console.warn('Supabase admin conv load:', e);
      }
    }

    // 3. Fallback to localStorage
    if (loadedTabs.length === 0) {
      try {
        const saved = localStorage.getItem('alwaysus_chat_tabs');
        if (saved) loadedTabs = JSON.parse(saved);
      } catch (e) {}
    }

    setTabs(loadedTabs);
    setSelectedTabId((currentSelected) => {
      if (currentSelected && loadedTabs.some((t) => t.id === currentSelected)) {
        return currentSelected;
      }
      return loadedTabs.length > 0 ? loadedTabs[0].id : null;
    });

    // 4. Load Attention Requests
    let loadedAlerts = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: attn } = await supabase
          .from('attention_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (attn && attn.length > 0) loadedAlerts = attn;
      } catch (e) {}
    }
    if (loadedAlerts.length === 0) {
      try {
        const savedAlerts = localStorage.getItem('alwaysus_attention_requests');
        if (savedAlerts) loadedAlerts = JSON.parse(savedAlerts);
      } catch (e) {}
    }
    setAttentionRequests(loadedAlerts);

    // 5. Load Personality Profile & Examples
    try {
      const savedPrompt = localStorage.getItem('alwaysus_system_prompt');
      if (savedPrompt) setSystemPrompt(savedPrompt);

      const savedExamples = localStorage.getItem('alwaysus_personality_examples');
      if (savedExamples) setExamples(JSON.parse(savedExamples));
    } catch (e) {}

    if (showSpinner) setLoading(false);
  }

  // Delete Individual Chat Tab (Admin Exclusive Feature)
  const handleDeleteTab = async (tabId) => {
    if (!confirm('Are you sure you want to permanently delete this chat tab and its messages?')) return;

    // Call server sync to delete everywhere
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_tab', tabId })
    }).catch(() => {});

    // Delete in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').delete().eq('conversation_id', tabId);
        await supabase.from('conversations').delete().eq('id', tabId);
      } catch (e) {
        console.warn('Supabase delete tab failed:', e);
      }
    }

    const updated = tabs.filter((t) => t.id !== tabId);
    setTabs(updated);
    localStorage.setItem('alwaysus_chat_tabs', JSON.stringify(updated));

    if (selectedTabId === tabId) {
      setSelectedTabId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Reset All Chats
  const handleResetAllChats = async () => {
    if (!confirm('Are you sure you want to permanently delete ALL chat tabs and conversation history?')) return;

    // Call server sync to clear everywhere
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_all' })
    }).catch(() => {});

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').delete().neq('id', 'null');
        await supabase.from('conversations').delete().neq('id', 'null');
      } catch (e) {}
    }

    localStorage.removeItem('alwaysus_chat_tabs');
    setTabs([]);
    setSelectedTabId(null);
    alert('All chat conversations have been cleared.');
  };

  // Attention Requests Actions
  const handleMarkAttentionDone = async (id) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('attention_requests').update({ status: 'resolved' }).eq('id', id);
      } catch (e) {}
    }

    const updated = attentionRequests.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a));
    setAttentionRequests(updated);
    localStorage.setItem('alwaysus_attention_requests', JSON.stringify(updated));
  };

  const handleDeleteAttention = async (id) => {
    if (!confirm('Delete this attention request record?')) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('attention_requests').delete().eq('id', id);
      } catch (e) {}
    }

    const updated = attentionRequests.filter((a) => a.id !== id);
    setAttentionRequests(updated);
    localStorage.setItem('alwaysus_attention_requests', JSON.stringify(updated));
  };

  // Save Personality Settings
  const handleSavePersonality = (e) => {
    e.preventDefault();
    localStorage.setItem('alwaysus_system_prompt', systemPrompt);
    localStorage.setItem('alwaysus_personality_examples', JSON.stringify(examples));

    if (isSupabaseConfigured && supabase) {
      supabase.from('personality').upsert({
        name: 'Shakti',
        system_prompt: systemPrompt,
        communication_style: communicationStyle,
        language: languageStyle,
        updated_at: new Date().toISOString()
      }).then(() => {});
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Add Real Conversational Example
  const handleAddExample = (e) => {
    e.preventDefault();
    if (!newExSituation.trim() || !newExMessage.trim()) return;

    const newEx = {
      id: 'ex_' + Date.now(),
      category: newExCategory,
      situation: newExSituation.trim(),
      message: newExMessage.trim()
    };

    const updated = [newEx, ...examples];
    setExamples(updated);
    localStorage.setItem('alwaysus_personality_examples', JSON.stringify(updated));

    setNewExSituation('');
    setNewExMessage('');
    setShowAddExModal(false);
  };

  const handleDeleteExample = (id) => {
    if (!confirm('Delete this example?')) return;
    const updated = examples.filter((ex) => ex.id !== id);
    setExamples(updated);
    localStorage.setItem('alwaysus_personality_examples', JSON.stringify(updated));
  };

  const selectedTab = tabs.find((t) => t.id === selectedTabId) || tabs[0];
  const pendingAttentionCount = attentionRequests.filter((a) => a.status === 'pending').length;
  const totalMessagesCount = tabs.reduce((acc, t) => acc + (t.messages?.length || 0), 0);

  return (
    <AuthGuard requireRole="owner">
      <div>
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
              👑 Owner Admin Dashboard
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              View conversations between Nishuu &amp; Shakti in real time, monitor alerts, and adjust personality.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => loadAllData(true)} className="btn btn-secondary btn-sm">
              🔄 Refresh
            </button>
            <button onClick={handleResetAllChats} className="btn btn-danger btn-sm">
              🗑️ Reset All Chats
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="admin-stats-grid">
          <div className="card" style={{ padding: '1rem', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Chat Tabs
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-secondary)', marginTop: '0.2rem' }}>
              {tabs.length}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Messages
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-secondary)', marginTop: '0.2rem' }}>
              {totalMessagesCount}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Attention Alerts
            </div>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: pendingAttentionCount > 0 ? '#C0267D' : 'var(--accent-secondary)',
                marginTop: '0.2rem'
              }}
            >
              {pendingAttentionCount} pending
            </div>
          </div>
          <div className="card" style={{ padding: '1rem', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Live Partner Sync
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#16A34A', marginTop: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }}></span>
              Connected
            </div>
          </div>
        </div>

        {/* Navigation Section Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveSection('chats')}
            className={`btn btn-sm ${activeSection === 'chats' ? 'btn-primary' : 'btn-secondary'}`}
          >
            💬 Partner &amp; Shakti Chats
          </button>
          <button
            onClick={() => setActiveSection('attention')}
            className={`btn btn-sm ${activeSection === 'attention' ? 'btn-primary' : 'btn-secondary'}`}
            style={pendingAttentionCount > 0 && activeSection !== 'attention' ? { borderColor: '#C0267D', color: '#C0267D' } : {}}
          >
            🔔 Attention Alerts {pendingAttentionCount > 0 ? `(${pendingAttentionCount})` : ''}
          </button>
          <button
            onClick={() => setActiveSection('personality')}
            className={`btn btn-sm ${activeSection === 'personality' ? 'btn-primary' : 'btn-secondary'}`}
          >
            ✨ Personality Studio &amp; Examples
          </button>
        </div>

        {loading && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading conversations...</p>
        )}

        {/* SECTION 1: CHATS & TRANSCRIPTS (READ-ONLY VIEWER FOR PARTNER-AI CHATS) */}
        {!loading && activeSection === 'chats' && (
          <div className="admin-chat-grid">
            {/* Left: Chat Tabs List with Admin Delete buttons */}
            <div className="card" style={{ padding: '1rem' }}>
              <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                Chat Tabs ({tabs.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => setSelectedTabId(tab.id)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: tab.id === selectedTabId ? 'var(--bg-secondary)' : 'var(--card-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: tab.id === selectedTabId ? 700 : 500,
                          color: tab.id === selectedTabId ? 'var(--accent-secondary)' : 'var(--text-primary)'
                        }}
                      >
                        💬 {tab.title}
                      </span>
                      {/* ADMIN EXCLUSIVE: DELETE CHAT TAB */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTab(tab.id);
                        }}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', borderRadius: '4px' }}
                        title="Delete this chat tab"
                      >
                        Delete
                      </button>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {tab.messages?.length || 0} messages
                    </div>
                  </div>
                ))}
                {tabs.length === 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>
                    No conversations yet from Partner.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Pure Read-Only Message Transcript */}
            <div className="card" style={{ padding: '1.25rem', minHeight: '440px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.65rem',
                  marginBottom: '1rem'
                }}
              >
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                    Transcript: {selectedTab?.title || 'None Selected'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Read-only log of messages exchanged between Nishuu and Shakti.
                  </div>
                </div>
                {selectedTab && (
                  <button
                    onClick={() => handleDeleteTab(selectedTab.id)}
                    className="btn btn-danger btn-sm"
                  >
                    🗑️ Delete This Tab
                  </button>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  maxHeight: '520px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem'
                }}
              >
                {selectedTab?.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '14px',
                      background: msg.sender_type === 'partner' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: msg.sender_type === 'partner' ? '#FFFFFF' : 'var(--text-primary)',
                      maxWidth: '82%',
                      alignSelf: msg.sender_type === 'partner' ? 'flex-end' : 'flex-start',
                      fontSize: '0.875rem',
                      lineHeight: 1.45
                    }}
                  >
                    <div>{msg.content}</div>
                    <div
                      style={{
                        fontSize: '0.675rem',
                        color: msg.sender_type === 'partner' ? '#FEE2E2' : 'var(--text-muted)',
                        marginTop: '0.25rem',
                        textAlign: 'right'
                      }}
                    >
                      {msg.sender_type === 'partner' ? 'Nishuu (Partner)' : 'Shakti'} • {msg.created_at}
                    </div>
                  </div>
                ))}

                {(!selectedTab || !selectedTab.messages || selectedTab.messages.length === 0) && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 1rem' }}>
                    No messages in this chat tab yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: ATTENTION REQUESTS */}
        {!loading && activeSection === 'attention' && (
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3
              className="card-title"
              style={{
                fontSize: '1.05rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              🔔 Partner Attention Requests
            </h3>
            {attentionRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 1rem' }}>
                No attention requests received yet. Nishuu is happy and calm! 🌸
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {attentionRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${req.status === 'pending' ? '#FBCFE8' : 'var(--border-subtle)'}`,
                      background: req.status === 'pending' ? '#FFF5F9' : 'var(--bg-secondary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '99px',
                            background: req.status === 'pending' ? '#FDE8F4' : '#E5E7EB',
                            color: req.status === 'pending' ? '#C0267D' : '#6B7280',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}
                        >
                          {req.status || 'pending'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {req.created_at
                            ? new Date(req.created_at).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        &ldquo;{req.message}&rdquo;
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        From: {req.sender_name || 'Nishuu'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAttentionDone(req.id)}
                          className="btn btn-sm btn-primary"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          ✅ Mark Done
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAttention(req.id)}
                        className="btn btn-sm btn-secondary"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: PERSONALITY STUDIO & EXAMPLES */}
        {!loading && activeSection === 'personality' && (
          <div className="admin-personality-grid">
            {/* Left: System Prompt & Tone */}
            <div>
              <div className="card">
                <h3 className="card-title">Core Personality Prompt</h3>
                {savedSuccess && (
                  <div
                    style={{
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontSize: '0.85rem',
                      marginBottom: '1rem',
                      fontWeight: 500
                    }}
                  >
                    ✅ Personality instructions saved successfully!
                  </div>
                )}
                <form onSubmit={handleSavePersonality}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Tone Blend
                    </label>
                    <input
                      type="text"
                      value={communicationStyle}
                      onChange={(e) => setCommunicationStyle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Language Nuance
                    </label>
                    <input
                      type="text"
                      value={languageStyle}
                      onChange={(e) => setLanguageStyle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      System Instruction Prompt (Rules, Facts, Flirting, Roothna)
                    </label>
                    <textarea
                      rows={14}
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        lineHeight: 1.45,
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    💾 Save Personality Instructions
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Conversational Examples CRUD */}
            <div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>
                    Real Conversational Examples ({examples.length})
                  </h3>
                  <button onClick={() => setShowAddExModal(true)} className="btn btn-primary btn-sm">
                    + Add Example
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Real examples teach Shakti how you naturally communicate across different romantic, naughty, and pouty emotional vibes.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {examples.map((ex) => (
                    <div
                      key={ex.id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '99px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--accent-secondary)',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}
                        >
                          {ex.category}
                        </span>
                        <button
                          onClick={() => handleDeleteExample(ex.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem' }}
                        >
                          Delete
                        </button>
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.2rem' }}>
                        Situation: {ex.situation}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.4 }}>
                        &ldquo;{ex.message}&rdquo;
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Example */}
        {showAddExModal && (
          <div className="modal-overlay" onClick={() => setShowAddExModal(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
              <h3 className="card-title">Add Conversational Example</h3>
              <form onSubmit={handleAddExample}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={newExCategory}
                    onChange={(e) => setNewExCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="romantic">Romantic</option>
                    <option value="naughty">Naughty / Spicy Banter</option>
                    <option value="roothna">Roothna / Narajgi / Tantrums</option>
                    <option value="comforting">Comforting</option>
                    <option value="playful">Playful Banter</option>
                    <option value="apologizing">Apologizing</option>
                    <option value="daily">Daily Check-in</option>
                    <option value="reassurance">Reassurance</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Situation
                  </label>
                  <input
                    type="text"
                    value={newExSituation}
                    onChange={(e) => setNewExSituation(e.target.value)}
                    placeholder="e.g. When she gets naughty or ignores you..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Your Real Phrased Reply
                  </label>
                  <textarea
                    rows={3}
                    value={newExMessage}
                    onChange={(e) => setNewExMessage(e.target.value)}
                    placeholder="How would you talk to Nishuu here? Use Hinglish and nicknames..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAddExModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Example
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
