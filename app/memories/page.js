'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import AuthGuard from '../../components/AuthGuard';

const INITIAL_MEMORIES = [
  {
    id: 'm1',
    category: 'date',
    content: 'Nishuu birthday on 19 Jan 🎂',
    created_at: 'Jan 19'
  },
  {
    id: 'm2',
    category: 'date',
    content: 'Shakti birthday on 05 Dec 🎉',
    created_at: 'Dec 05'
  },
  {
    id: 'm3',
    category: 'date',
    content: 'Relationship Anniversary on 10 Oct 💑',
    created_at: 'Oct 10'
  },
  {
    id: 'm4',
    category: 'milestone',
    content:
      'Proposal date: 10 Oct 2024. Nishuu ne propose kiya tha agle hi din! Hum Free Fire Max game me mile the aur usne Abhi naam ke dost se mera Instagram handle liya tha, fir baat start hui. 💍',
    created_at: 'Oct 10, 2024'
  },
  {
    id: 'm5',
    category: 'milestone',
    content: 'Started our journey together — forever wala vibe 🥹✨',
    created_at: '2024'
  }
];

export default function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('preference');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setMemories(
            data.map((m) => ({
              id: m.id,
              category: m.category,
              content: m.content,
              created_at: m.created_at
                ? new Date(m.created_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : ''
            }))
          );
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Supabase memories fallback:', e);
      }
    }

    // Fallback: localStorage
    const saved = localStorage.getItem('alwaysus_memories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMemories(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    // Default seed
    setMemories(INITIAL_MEMORIES);
    localStorage.setItem('alwaysus_memories', JSON.stringify(INITIAL_MEMORIES));
    setLoading(false);
  }

  async function persistMemories(newList) {
    setMemories(newList);
    localStorage.setItem('alwaysus_memories', JSON.stringify(newList));
  }

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const dateStr = new Date().toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    let newMem = {
      id: 'm_' + Date.now(),
      category,
      content: content.trim(),
      created_at: dateStr
    };

    // Try Supabase insert
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('memories')
          .insert({ category, content: content.trim() })
          .select()
          .single();

        if (!error && data) {
          newMem = {
            id: data.id,
            category: data.category,
            content: data.content,
            created_at: dateStr
          };
        }
      } catch (e) {
        console.warn('Supabase insert failed, using local:', e);
      }
    }

    await persistMemories([newMem, ...memories]);
    setContent('');
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('memories').delete().eq('id', id);
      } catch (e) {}
    }

    await persistMemories(memories.filter((m) => m.id !== id));
  };

  const filteredMemories = memories.filter((m) => filter === 'all' || m.category === filter);

  return (
    <AuthGuard>
      <div>
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
              Shared Memories &amp; Facts
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Important dates, proposal story, and memories Shakti always keeps close 💕
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <span>+</span> Add Memory
          </button>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem'
          }}
        >
          {['all', 'date', 'milestone', 'preference', 'joke', 'note'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {loading && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            Loading memories...
          </p>
        )}

        {/* Grid */}
        {!loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem'
            }}
          >
            {filteredMemories.map((mem) => (
              <div key={mem.id} className="card" style={{ marginBottom: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.6rem',
                      background: 'var(--bg-secondary)',
                      color: 'var(--accent-secondary)',
                      borderRadius: '99px',
                      fontWeight: 600
                    }}
                  >
                    {mem.category.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {mem.created_at}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    color: 'var(--text-primary)',
                    marginBottom: '0.85rem'
                  }}
                >
                  {mem.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleDelete(mem.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {filteredMemories.length === 0 && (
              <p
                style={{
                  color: 'var(--text-muted)',
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  padding: '2rem'
                }}
              >
                No memories in this category yet.
              </p>
            )}
          </div>
        )}

        {/* Add Memory Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
              <h3 className="card-title">Add New Memory 💝</h3>
              <form onSubmit={handleAddMemory}>
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '0.35rem'
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="date">Important Date</option>
                    <option value="milestone">Relationship Milestone</option>
                    <option value="preference">Personal Preference</option>
                    <option value="joke">Inside Joke</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '0.35rem'
                    }}
                  >
                    Memory Content
                  </label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="e.g. Loves hazelnut cold coffee..."
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
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setContent('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Memory 💕
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
