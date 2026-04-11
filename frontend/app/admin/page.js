'use client';
import { useState, useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import { adminAPI } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [debatesWeek, setDebatesWeek] = useState([]);
  const [categoriesPie, setCategoriesPie] = useState([]);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        toast.error('Unauthorised access');
        router.push('/');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, router, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const { data } = await adminAPI.getAnalytics();
        setStats(data.stats);
        setDebatesWeek(data.debatesWeek);
        setCategoriesPie(data.categoriesPie);
      } else if (activeTab === 'users') {
        const { data } = await adminAPI.getUsers();
        setUsers(data.users);
      }
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (id, isBanned) => {
    try {
      const { data } = await adminAPI.banUser(id);
      setUsers(users.map(u => u._id === id ? { ...u, isBanned: data.isBanned } : u));
      toast.success(data.message);
    } catch (err) {
      toast.error('Failed to toggle ban status');
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  if (authLoading || loading) return <div style={{ height: '100vh', background: 'var(--bg-base)' }}><Navbar /><div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin Portal...</div></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 600 }}>Admin Dashboard</h1>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Button variant={activeTab === 'analytics' ? 'primary' : 'secondary'} onClick={() => setActiveTab('analytics')}>Analytics</Button>
          <Button variant={activeTab === 'users' ? 'primary' : 'secondary'} onClick={() => setActiveTab('users')}>Manage Users</Button>
        </div>

        {activeTab === 'analytics' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Users</div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalUsers}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Debates</div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalDebates}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Arguments</div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalArguments}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Debates Created (Last 7 Days)</h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={debatesWeek}>
                      <XAxis dataKey="_id" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-elevated)' }} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                      <Bar dataKey="count" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Top Categories</h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoriesPie} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="_id">
                        {categoriesPie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                  {categoriesPie.map((c, i) => (
                    <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      {c._id}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>User</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Email</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Reputation</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random&length=1&color=fff&size=32`} style={{ width: 32, height: 32, borderRadius: '50%' }} alt="" />
                        <span style={{ fontWeight: 500 }}>{u.username}</span>
                        {u.role === 'admin' && <span style={{ fontSize: '0.7rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.1rem 0.4rem', borderRadius: 999 }}>Admin</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>{u.reputationPoints}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: 999, background: u.isBanned ? 'rgba(240,80,110,0.1)' : 'rgba(16,185,129,0.1)', color: u.isBanned ? 'var(--accent)' : 'var(--accent-green)' }}>
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Button variant="secondary" size="sm" onClick={() => handleBan(u._id, u.isBanned)} disabled={u.role === 'admin'}>
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
