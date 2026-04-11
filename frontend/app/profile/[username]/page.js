'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from '@/lib/navigation';
import Link from '@/components/navigation/Link';
import Navbar from '../../../components/layout/Navbar';
import Button from '../../../components/ui/Button';
import DebateCard from '../../../components/debate/DebateCard';
import { userAPI, authAPI } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technology','Education','Environment','Business','Politics','Science','Health','Society','Culture','Sports','Other'];

export default function ProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const { user: currentUser, updateUser } = useAuth();

  const [profile, setProfile]     = useState(null);
  const [debates, setDebates]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('debates');
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({ username: '', bio: '', philosophicalStance: 'Neutral', socialLinks: { twitter: '', github: '', website: '', instagram: '', discord: '' } });
  const [saving, setSaving]       = useState(false);
  
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, debatesRes] = await Promise.all([
          userAPI.getProfile(username),
          userAPI.getUserDebates(username),
        ]);
        setProfile(profileRes.data.user);
        setDebates(debatesRes.data.debates);
        const { username: profileUsername, bio, philosophicalStance, socialLinks } = profileRes.data.user;
        setEditForm({ 
          username: profileUsername, 
          bio: bio || '', 
          avatar: profileRes.data.user.avatar || '',
          philosophicalStance: philosophicalStance || 'Neutral', 
          socialLinks: socialLinks || { twitter: '', github: '', website: '', instagram: '', discord: '' } 
        });
      } catch {
        toast.error('Profile not found.');
        router.push('/debates');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username, router]);

  useEffect(() => {
    if (activeTab === 'bookmarks' && isOwnProfile && bookmarks.length === 0) {
      const loadBookmarks = async () => {
        setLoadingBookmarks(true);
        try {
          const { data } = await userAPI.getBookmarks();
          setBookmarks(data.debates);
        } catch {
          toast.error('Failed to load bookmarks');
        } finally {
          setLoadingBookmarks(false);
        }
      };
      loadBookmarks();
    }
  }, [activeTab, isOwnProfile, bookmarks.length]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(editForm);
      setProfile(prev => ({ ...prev, ...data.user }));
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated!');
      if (data.user.username !== username) router.push(`/profile/${data.user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB');
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFollowCategory = async (cat) => {
    try {
      const { data } = await userAPI.followCategory(cat);
      updateUser({ followedCategories: data.followedCategories });
      toast.success(data.following ? `Following ${cat}` : `Unfollowed ${cat}`);
    } catch {
      toast.error('Failed to update.');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Navbar />
        <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem' }}>
          <div className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const stats = [
    { label: 'Reputation',  value: profile.reputationPoints || 0,    icon: '⚡' },
    { label: 'Debates',     value: profile.debatesParticipated || 0,  icon: '🗣️' },
    { label: 'Arguments',   value: profile.argumentsPosted || 0,      icon: '💬' },
    { label: 'Votes',       value: profile.totalVotesReceived || 0,   icon: '▲' },
    { label: 'Wins',        value: profile.debateWins || 0,           icon: '🏆' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Profile card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '1.5rem' }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Edit profile</h3>
              
              {/* Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                <img
                  src={editForm.avatar ? editForm.avatar : `https://ui-avatars.com/api/?name=${profile.username}&background=random&length=1&color=fff&size=100&bold=true`}
                  alt="Avatar Preview"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-light)' }}
                />
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="file" id="avatar-upload" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                    <label htmlFor="avatar-upload" style={{ cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)', background: 'var(--brand-light)', padding: '0.4rem 0.875rem', borderRadius: 999, transition: 'all 0.2s' }}>
                      Upload PFP
                    </label>
                    {editForm.avatar && (
                      <button type="button" onClick={() => setEditForm(prev => ({ ...prev, avatar: '' }))} style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--accent)', background: 'rgba(240,80,110,0.1)', padding: '0.4rem 0.875rem', borderRadius: 999, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Remove
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>JPG, PNG or GIF (Max 5MB)</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Username</label>
                  <input value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                    className="input-base" placeholder="username" maxLength={30} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Philosophical Stance</label>
                  <select value={editForm.philosophicalStance} onChange={e => setEditForm(f => ({ ...f, philosophicalStance: e.target.value }))} className="input-base">
                    {['Neutral','Stoic','Nihilist','Existentialist','Utilitarian','Absurdist','Rationalist','Empiricist'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Bio</label>
                <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3} maxLength={300} placeholder="Tell the community about yourself..."
                  style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', padding: '0.75rem 1rem', resize: 'vertical', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{editForm.bio.length}/300</span>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Social Links</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input value={editForm.socialLinks.twitter} onChange={e => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, twitter: e.target.value } }))} className="input-base" placeholder="Twitter URL" />
                  <input value={editForm.socialLinks.github} onChange={e => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, github: e.target.value } }))} className="input-base" placeholder="GitHub URL" />
                  <input value={editForm.socialLinks.website} onChange={e => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, website: e.target.value } }))} className="input-base" placeholder="Personal Website URL" />
                  <input value={editForm.socialLinks.instagram} onChange={e => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, instagram: e.target.value } }))} className="input-base" placeholder="Instagram URL" />
                  <input value={editForm.socialLinks.discord} onChange={e => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, discord: e.target.value } }))} className="input-base" placeholder="Discord Invite / Handle" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="primary" size="sm" loading={saving} onClick={handleSaveProfile}>Save changes</Button>
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=random&length=1&color=fff&size=100&bold=true`}
                alt={profile.username}
                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-light)', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
                    {profile.username}
                  </h1>
                  {profile.role === 'admin' && (
                    <span className="badge badge-brand">🛡️ Admin</span>
                  )}
                  {profile.philosophicalStance && profile.philosophicalStance !== 'Neutral' && (
                    <span style={{ padding: '0.2rem 0.6rem', border: '1px solid var(--border)', borderRadius: 999, fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>
                      🏛️ {profile.philosophicalStance}
                    </span>
                  )}
                </div>
                {profile.bio ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>{profile.bio}</p>
                ) : isOwnProfile ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: '0.75rem' }}>No bio yet. Click edit to add one.</p>
                ) : null}
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  {profile.socialLinks?.twitter && <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>🐦 Twitter</a>}
                  {profile.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>🐙 GitHub</a>}
                  {profile.socialLinks?.website && <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>🌐 Website</a>}
                  {profile.socialLinks?.instagram && <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>📸 Instagram</a>}
                  {profile.socialLinks?.discord && <a href={profile.socialLinks.discord} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>🎮 Discord</a>}
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              {isOwnProfile && (
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>✏️ Edit profile</Button>
              )}
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            {stats.map(({ label, value, icon }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--brand)', marginBottom: '0.2rem' }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{icon} {label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
          {[
            ['debates', '🗣️ Debates'],
            ...(isOwnProfile ? [['categories', '📌 Following'], ['bookmarks', '🔖 Bookmarks']] : []),
          ].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                background: activeTab === tab ? 'var(--brand)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'debates' && (
          debates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <p>No debates yet.</p>
              {isOwnProfile && <Button variant="primary" size="md" onClick={() => router.push('/debates/create')} style={{ marginTop: '1rem' }}>Create your first debate</Button>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
              {debates.map(d => <DebateCard key={d._id} debate={d} />)}
            </div>
          )
        )}

        {activeTab === 'categories' && isOwnProfile && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Categories you follow
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {CATEGORIES.map(cat => {
                const isFollowing = currentUser?.followedCategories?.includes(cat);
                return (
                  <button key={cat} onClick={() => handleFollowCategory(cat)}
                    style={{
                      padding: '0.4rem 1rem', borderRadius: 999, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                      border: '1px solid', borderColor: isFollowing ? 'var(--brand)' : 'var(--border)',
                      background: isFollowing ? 'var(--brand-light)' : 'transparent',
                      color: isFollowing ? 'var(--brand)' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}>
                    {isFollowing ? '✓ ' : '+ '}{cat}
                  </button>
                );
              })}
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              You'll get notified when new debates are created in categories you follow.
            </p>
          </div>
        )}

        {activeTab === 'bookmarks' && isOwnProfile && (
          loadingBookmarks ? (
            <div className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
          ) : bookmarks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p>🔖 No bookmarks yet. Save debates to read them later!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
              {bookmarks.map(d => <DebateCard key={d._id} debate={d} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}
