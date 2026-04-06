import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT from localStorage
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

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('dh_token');
      localStorage.removeItem('dh_user');
      // Redirect to login only if not already there
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getPublicProfile: (username) => api.get(`/auth/profile/${username}`),
};

export const debateAPI = {
  create:        (data)          => api.post('/debates', data),
  getAll:        (params)        => api.get('/debates', { params }),
  getOne:        (id)            => api.get(`/debates/${id}`),
  update:        (id, data)      => api.put(`/debates/${id}`, data),
  remove:        (id)            => api.delete(`/debates/${id}`),
  getTrending:   ()              => api.get('/debates/trending'),
  getCategories: ()              => api.get('/debates/categories'),
};

export const argumentAPI = {
  create:     (debateId, data)   => api.post(`/debates/${debateId}/arguments`, data),
  getAll:     (debateId, params) => api.get(`/debates/${debateId}/arguments`, { params }),
  getReplies: (id)               => api.get(`/arguments/${id}/replies`),
  vote:       (id, voteType)     => api.post(`/arguments/${id}/vote`, { voteType }),
  getMyVote:  (id)               => api.get(`/arguments/${id}/my-vote`),
  remove:     (id)               => api.delete(`/arguments/${id}`),
};

export default api;

