import api from './api';

export const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  return !!token;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const login = async (email, password) => {
  try {
    const response = await api.auth.login(email, password);

    // Accept multiple response shapes: { tokens: {access,refresh} } or { access, refresh }
    const tokens = response.tokens || { access: response.access, refresh: response.refresh } || (response.data && response.data.tokens);
    const user = response.user || (response.data && response.data.user) || null;

    if (tokens && (tokens.access || tokens.refresh)) {
      if (tokens.access) localStorage.setItem("access_token", tokens.access);
      if (tokens.refresh) localStorage.setItem("refresh_token", tokens.refresh);
      if (user) localStorage.setItem("user", JSON.stringify(user));
    }

    // eslint-disable-next-line no-console
    console.debug('[auth] login - token stored:', !!localStorage.getItem('access_token'));

    return response;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.auth.register(userData);
    // Don't store tokens on registration — user must log in explicitly
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};
