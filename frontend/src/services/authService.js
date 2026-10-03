import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  
  console.log('📤 Login API response:', response.data);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    console.log('💾 Saved user to localStorage:', response.data.user);
    console.log('👑 Role saved:', response.data.user.role);
  }
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('👋 User logged out');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    console.log('📤 Current user response:', response.data);
    return response.data.user;
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    throw error;
  }
};

export const updateProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data.user;
};

export const getBadges = async () => {
  const response = await api.get('/users/badges');
  return response.data.badges;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.imageUrl;
};