import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('dh_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('dh_token');
      localStorage.removeItem('dh_user');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authAPI = {
  register:         (data)     => api.post('/auth/register', data),
  login:            (data)     => api.post('/auth/login', data),
  googleAuth:       (credential) => api.post('/auth/google', { credential }),
  getMe:            ()         => api.get('/auth/me'),
  updateProfile:    (data)     => api.put('/auth/update-profile', data),
  changePassword:   (data)     => api.put('/auth/change-password', data),
  getPublicProfile: (username) => api.get(`/auth/profile/${username}`),
};

// ── Debates ──
export const debateAPI = {
  create:         (data)   => api.post('/debates', data),
  getAll:         (params) => api.get('/debates', { params }),
  getOne:         (id)     => api.get(`/debates/${id}`),
  update:         (id, data) => api.put(`/debates/${id}`, data),
  remove:         (id)     => api.delete(`/debates/${id}`),
  getTrending:    ()       => api.get('/debates/trending'),
  getCategories:  ()       => api.get('/debates/categories'),
};

// ── Arguments ──
export const argumentAPI = {
  create:     (debateId, data)   => api.post(`/debates/${debateId}/arguments`, data),
  getAll:     (debateId, params) => api.get(`/debates/${debateId}/arguments`, { params }),
  getReplies: (id)               => api.get(`/arguments/${id}/replies`),
  vote:       (id, voteType)     => api.post(`/arguments/${id}/vote`, { voteType }),
  getMyVote:  (id)               => api.get(`/arguments/${id}/my-vote`),
  remove:     (id)               => api.delete(`/arguments/${id}`),
};

// ── Users ──
export const userAPI = {
  getProfile:     (username) => api.get(`/users/${username}`),
  getUserDebates: (username) => api.get(`/users/${username}/debates`),
  getLeaderboard: (params)   => api.get('/users/leaderboard', { params }),
  followCategory: (category) => api.put('/users/follow-category', { category }),
  toggleBookmark: (debateId) => api.put(`/users/bookmark/${debateId}`),
  getBookmarks:   ()         => api.get('/users/bookmarks'),
};

// ── Notifications ──
export const notificationAPI = {
  getAll:         (params) => api.get('/notifications', { params }),
  getUnreadCount: ()       => api.get('/notifications/unread-count'),
  markAllRead:    ()       => api.put('/notifications/read-all'),
  markOneRead:    (id)     => api.put(`/notifications/${id}/read`),
  clearAll:       ()       => api.delete('/notifications'),
};

// ── Search ──
export const searchAPI = {
  search:         (params) => api.get('/search', { params }),
  getSuggestions: (q)      => api.get('/search/suggestions', { params: { q } }),
};

// ── AI ──
export const aiAPI = {
  summarize:      (debateId) => api.post(`/ai/summarize/${debateId}`),
  generateTopics: (category) => api.post('/ai/generate-topics', { category }),
};

// ── Admin ──
export const adminAPI = {
  getUsers:       (params)   => api.get('/admin/users', { params }),
  banUser:        (id)       => api.put(`/admin/users/${id}/ban`),
  getAnalytics:   ()         => api.get('/admin/analytics'),
};

export default api;
