'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import AuthGuard from '../../components/AuthGuard';

const INITIAL_PHOTOS = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
    caption: 'When you smiled and my entire world lit up ✨',
    created_at: 'Oct 10, 2024'
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
    caption: 'Our favorite cozy evening talks ☕❤️',
    created_at: 'Dec 05, 2024'
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop&q=80',
    caption: 'Late night Free Fire games where it all started 🎮🌸',
    created_at: 'Jan 19, 2025'
  }
];

export default function PhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    setLoading(true);
    // 1. Try Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setPhotos(
            data.map((p) => ({
              id: p.id,
              url: p.url,
              caption: p.caption,
              created_at: p.created_at
                ? new Date(p.created_at).toLocaleDateString('en-IN', {
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
        console.warn('Supabase photos fallback:', e);
      }
    }

    // 2. Try localStorage
    const saved = localStorage.getItem('alwaysus_photos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPhotos(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    // 3. Fallback initial
    setPhotos(INITIAL_PHOTOS);
    localStorage.setItem('alwaysus_photos', JSON.stringify(INITIAL_PHOTOS));
    setLoading(false);
  }

  function persistPhotos(newList) {
    setPhotos(newList);
    localStorage.setItem('alwaysus_photos', JSON.stringify(newList));
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Photo size is too large (max 8MB). Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!previewUrl) {
      alert('Please select an image file first.');
      return;
    }

    setUploading(true);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    let newPhoto = {
      id: 'photo_' + Date.now(),
      url: previewUrl,
      caption: caption.trim() || 'Special Memory ❤️',
      created_at: dateStr
    };

    // Try Supabase insert
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('photos')
          .insert({ url: previewUrl, caption: caption.trim() })
          .select()
          .single();

        if (!error && data) {
          newPhoto = {
            id: data.id,
            url: data.url,
            caption: data.caption,
            created_at: dateStr
          };
        }
      } catch (e) {
        console.warn('Supabase photo insert failed, saving locally:', e);
      }
    }

    persistPhotos([newPhoto, ...photos]);
    setUploading(false);
    setShowUploadModal(false);
    setCaption('');
    setPreviewUrl('');
  };

  const handleDeletePhoto = async (id) => {
    if (!confirm('Are you sure you want to delete this photo memory?')) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('photos').delete().eq('id', id);
      } catch (e) {}
    }

    persistPhotos(photos.filter((p) => p.id !== id));
  };

  return (
    <AuthGuard>
      <div>
        {/* Header */}
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
              Private Photo Album 📸
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Safe, personal gallery of our most cherished moments together.
            </p>
          </div>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
            <span>📷</span> Upload Photo
          </button>
        </div>

        {loading && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            Loading your album...
          </p>
        )}

        {/* Photos Grid */}
        {!loading && (
          <div className="photo-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="photo-card">
                <div className="photo-img-wrap">
                  <img src={photo.url} alt={photo.caption} loading="lazy" />
                </div>
                <div className="photo-details">
                  <p className="photo-caption">{photo.caption}</p>
                  <div className="photo-footer">
                    <span>{photo.created_at}</span>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {photos.length === 0 && (
              <div
                className="card"
                style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '0.25rem' }}>
                  No photos uploaded yet
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Keep your special shared pictures in this private space.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload Your First Photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
              <h3 className="card-title">Upload Private Photo 📷</h3>
              <form onSubmit={handleUploadPhoto}>
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                  >
                    Select Photo File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Supports JPG, PNG, WEBP, GIF (Max 8MB)
                  </div>
                </div>

                {previewUrl && (
                  <div
                    style={{
                      height: '180px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      marginBottom: '1rem',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                  >
                    Caption / Memory
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Goa trip with babuu, coffee date..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => {
                      setShowUploadModal(false);
                      setPreviewUrl('');
                      setCaption('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={uploading || !previewUrl} className="btn btn-primary">
                    {uploading ? 'Saving Photo...' : 'Save to Album ❤️'}
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
