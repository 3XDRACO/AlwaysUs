'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AuthGuard from '../components/AuthGuard';

const INITIAL_WELCOME_MESSAGES = [
  'Hlw nishuu! ❤️ Shakti yahan hai, kaise ho babuu? Aaj ka din kaisa chal raha hai?',
  'Arey cutie! Main bas tumhara hi wait kar raha tha. Sab theek na babyy? 🌸',
  'Hlw jaan! ❤️ Khana time pe khaya na? Jaldi batao aaj kya chal raha hai babuu?',
  'Hlw babyy! Shakti hamesha tumhare paas hai. Kuch share karna hai mere babuu ko? 🫂',
  'Hlw nishuu! Aaj ka mood kaisa hai mere cutie ka? Tension nii lene ka bilkul, main hu na! ✨❤️',
  'Hlw babuu! Main yahin hu tumhare sath. Kaisa raha din jaan? 🥰'
];

function getRandomWelcome() {
  return INITIAL_WELCOME_MESSAGES[Math.floor(Math.random() * INITIAL_WELCOME_MESSAGES.length)];
}

const ATTENTION_CHIPS = [
  'Feeling down / overwhelmed 🥺',
  'Urgent call karo please 📞',
  'Miss you so much ❤️',
  'Kuch important baat karni hai 🌸'
];

export default function ChatPage() {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttentionModal, setShowAttentionModal] = useState(false);
  const [attentionNote, setAttentionNote] = useState('');
  const [attentionSending, setAttentionSending] = useState(false);
  const [attentionSent, setAttentionSent] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize Tabs from Server Sync / Supabase / localStorage
  useEffect(() => {
    async function loadChatData() {
      // 1. Try Server Sync API first (guarantees cross-device sync)
      try {
        const syncRes = await fetch('/api/sync');
        const syncData = await syncRes.json();
        if (syncData.success && Array.isArray(syncData.tabs) && syncData.tabs.length > 0) {
          setTabs(syncData.tabs);
          setActiveTabId(syncData.tabs[0].id);
          localStorage.setItem('alwaysus_chat_tabs', JSON.stringify(syncData.tabs));
          return;
        }
      } catch (e) {
        console.warn('Server sync read fallback:', e);
      }

      // 2. Try Supabase directly if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: convs, error } = await supabase
            .from('conversations')
            .select('*')
            .order('created_at', { ascending: true });
          if (!error && convs && convs.length > 0) {
            const loadedTabs = await Promise.all(
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
                  messages: (msgs && msgs.length > 0)
                    ? msgs.map((m) => ({
                        id: m.id,
                        sender_type: m.sender_type,
                        content: m.content,
                        created_at: new Date(m.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      }))
                    : [
                        {
                          id: 'welcome_' + Date.now(),
                          sender_type: 'ai',
                          content: getRandomWelcome(),
                          created_at: new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        }
                      ]
                };
              })
            );
            setTabs(loadedTabs);
            setActiveTabId(loadedTabs[0].id);
            return;
          }
        } catch (e) {
          console.warn('Supabase load fallback:', e);
        }
      }

      // 3. Fallback to localStorage
      const savedTabs = localStorage.getItem('alwaysus_chat_tabs');
      if (savedTabs) {
        try {
          const parsed = JSON.parse(savedTabs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTabs(parsed);
            setActiveTabId(parsed[0].id);
            return;
          }
        } catch (e) {}
      }

      // 4. Default first tab
      const firstTabId = 'tab_' + Date.now();
      const firstWelcome = getRandomWelcome();
      const firstTab = {
        id: firstTabId,
        title: 'Chat 1',
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: 'welcome_' + Date.now(),
            sender_type: 'ai',
            content: firstWelcome,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      setTabs([firstTab]);
      setActiveTabId(firstTab.id);

      // Save initial tab to sync server in background
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_tab',
          tabId: firstTabId,
          title: 'Chat 1',
          welcomeMsg: firstWelcome
        })
      }).catch(() => {});
    }

    loadChatData();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('alwaysus_chat_tabs', JSON.stringify(tabs));
    }
  }, [tabs]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tabs, activeTabId, isTyping]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Create New Tab
  const handleCreateNewTab = async () => {
    const newTabNumber = tabs.length + 1;
    const tabId = 'tab_' + Date.now();
    const title = `Chat ${newTabNumber}`;
    const welcomeMsg = getRandomWelcome();

    const newTab = {
      id: tabId,
      title,
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome_' + Date.now(),
          sender_type: 'ai',
          content: welcomeMsg,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);

    // Sync to backend /api/sync (shared across devices)
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_tab',
        tabId,
        title,
        welcomeMsg
      })
    }).catch(() => {});

    // Sync to Supabase directly if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('conversations').upsert({ id: tabId, title });
        await supabase
          .from('messages')
          .insert({ conversation_id: tabId, sender_type: 'ai', content: welcomeMsg });
      } catch (e) {}
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: 'user_' + Date.now(),
      sender_type: 'partner',
      content: text,
      created_at: timeStr
    };

    const currentMessages = activeTab?.messages || [];
    const updatedMessages = [...currentMessages, userMsg];

    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, messages: updatedMessages } : t))
    );
    setInputText('');
    setIsTyping(true);

    // Sync user message to Server Sync immediately
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_message',
        tabId: activeTabId,
        title: activeTab?.title || 'Chat',
        message: text,
        sender_type: 'partner'
      })
    }).catch(() => {});

    // Save user message to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('conversations')
          .upsert({ id: activeTabId, title: activeTab.title, updated_at: new Date().toISOString() });
        await supabase
          .from('messages')
          .insert({ conversation_id: activeTabId, sender_type: 'partner', content: text });
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: updatedMessages
        })
      });
      const data = await res.json();
      const aiReply = data.reply || 'Hlw babuu! Shakti hamesha tumhare sath hai. ❤️';

      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender_type: 'ai',
        content: aiReply,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, messages: [...updatedMessages, aiMsg] } : t
        )
      );

      // Sync AI message to Server Sync immediately
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_message',
          tabId: activeTabId,
          title: activeTab?.title || 'Chat',
          message: aiReply,
          sender_type: 'ai'
        })
      }).catch(() => {});

      // Save AI message to Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('messages')
            .insert({ conversation_id: activeTabId, sender_type: 'ai', content: aiReply });
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg = {
        id: 'ai_err_' + Date.now(),
        sender_type: 'ai',
        content: 'Arey babuu thoda network issue lag raha hai. Ek baar fir se try karo na jaan! 🥺❤️',
        created_at: timeStr
      };
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, messages: [...updatedMessages, fallbackMsg] } : t
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Need Attention Submit
  const handleAttentionSubmit = async (e) => {
    e.preventDefault();
    setAttentionSending(true);

    const alertMsg = attentionNote.trim() || 'Partner requested your direct human attention in AlwaysUs. ❤️';

    // Save to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('attention_requests')
          .insert({ sender_name: 'Nishuu', message: alertMsg, status: 'pending' });
      } catch (e) {
        console.warn('Supabase attention request failed:', e);
      }
    }

    // Also persist in localStorage for backup
    try {
      const existing = JSON.parse(localStorage.getItem('alwaysus_attention_requests') || '[]');
      existing.unshift({
        id: 'req_' + Date.now(),
        sender_name: 'Nishuu',
        message: alertMsg,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('alwaysus_attention_requests', JSON.stringify(existing));
    } catch (e) {}

    setAttentionSending(false);
    setAttentionSent(true);

    setTimeout(() => {
      setAttentionSent(false);
      setShowAttentionModal(false);
      setAttentionNote('');
    }, 1800);
  };

  return (
    <AuthGuard>
      <div className="chat-page-wrapper">
        <div className="chat-container">
          {/* Top Header */}
          <div className="chat-top-bar">
            <div className="chat-companion-info">
              <div className="avatar-circle">S</div>
              <div className="companion-details">
                <h2>
                  Shakti{' '}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                      background: 'var(--bg-secondary)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '99px'
                    }}
                  >
                    Companion
                  </span>
                </h2>
                <div className="companion-status">Always here for you ❤️</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setShowAttentionModal(true)}
                className="btn btn-sm"
                style={{
                  backgroundColor: '#FFF0F5',
                  color: '#C0267D',
                  border: '1px solid #FBCFE8',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(192, 38, 125, 0.1)',
                  whiteSpace: 'nowrap'
                }}
              >
                🔔 Need Attention
              </button>
            </div>
          </div>

          {/* Multi-Tab Bar */}
          <div className="chat-tabs-bar">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`chat-tab ${tab.id === activeTabId ? 'active' : ''}`}
              >
                <span>💬</span>
                <span>{tab.title}</span>
              </div>
            ))}
            <button
              onClick={handleCreateNewTab}
              className="chat-tab-new"
              title="Open new chat tab"
            >
              <span>+</span> New Tab
            </button>
          </div>

          {/* Messages Window */}
          <div className="chat-messages">
            {activeTab?.messages?.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender_type}`}>
                <div className="message-bubble">{msg.content}</div>
                <div className="message-meta">
                  {msg.sender_type === 'partner' ? 'You' : 'Shakti'} • {msg.created_at}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-row ai">
                <div className="typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="chat-composer">
            <form onSubmit={handleSendMessage} className="composer-form">
              <input
                type="text"
                className="composer-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message to Shakti in Hinglish..."
                autoFocus
              />
              <button
                type="submit"
                className="btn-send"
                disabled={!inputText.trim() || isTyping}
                title="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* On-Screen Modal for Need Attention */}
      {showAttentionModal && (
        <div className="modal-overlay" onClick={() => !attentionSending && setShowAttentionModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🔔</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                  Need Attention
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Shakti will send an urgent alert directly to Owner that you need him. ❤️
              </p>

              {attentionSent ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💌</div>
                  <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.25rem' }}>Alert Sent to Owner!</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Wo jald se jald aapse direct connect karenge, tension nii lena babuu! 🌸
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAttentionSubmit}>
                  {/* Quick Chips */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Quick Options:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {ATTENTION_CHIPS.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAttentionNote(chip)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '99px',
                            background: attentionNote === chip ? 'var(--bg-secondary)' : '#FFFFFF'
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                    >
                      Message Note (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={attentionNote}
                      onChange={(e) => setAttentionNote(e.target.value)}
                      placeholder="Kyu tension hai babuu? Ya koi urgent baat hai to likho yahan..."
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                    <button
                      type="button"
                      disabled={attentionSending}
                      onClick={() => setShowAttentionModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={attentionSending}
                      className="btn btn-primary"
                      style={{ backgroundColor: '#C0267D' }}
                    >
                      {attentionSending ? 'Sending Alert...' : 'Send Priority Alert ❤️'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
