// API utility for connecting frontend to Django backend

const API_BASE_URL = '/api';

/**
 * Get stored access token
 */
function getAccessToken() {
    return localStorage.getItem('access_token');
}

/**
 * Generic fetch wrapper for API calls
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAccessToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    };

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        
        // Handle 401 - try to refresh token (skip for auth endpoints)
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
        if (response.status === 401 && !options._retry && !isAuthEndpoint) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return apiRequest(endpoint, { ...options, _retry: true });
            }
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Refresh the access token using refresh token
 */
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            return true;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
    }
    
    // Clear tokens if refresh failed
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return false;
}

/**
 * API methods
 */
const api = {
    // GET request
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    
    // POST request
    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // PUT request
    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    // PATCH request
    patch: (endpoint, data) => apiRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    
    // DELETE request
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
    
    // Health check
    healthCheck: () => apiRequest('/health/'),

    // File upload (multipart/form-data) helper
    upload: async (endpoint, formData) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = getAccessToken();

        const headers = {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        const resp = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!resp.ok) {
            const err = await resp.json().catch(()=>({}));
            throw new Error(err.message || `Upload failed: ${resp.status}`);
        }

        return resp.json().catch(()=>({}));
    },

    // Auth endpoints
    auth: {
        login: (email, password) => apiRequest('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        
        register: (userData) => apiRequest('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),
        
        refreshToken: () => refreshAccessToken(),
        
        getProfile: () => apiRequest('/auth/profile/', { method: 'GET' }),
        
        updateProfile: (data) => apiRequest('/auth/profile/update/', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

        changePassword: (data) => apiRequest('/auth/change-password/', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },

    // Download file (for PDF export, etc.)
    downloadFile: async (endpoint, filename) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = getAccessToken();

        const headers = {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Download failed: ${response.status}`);
            }

            // Get the blob from response
            const blob = await response.blob();
            
            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'download.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
            return true;
        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    },
};

export default api;
