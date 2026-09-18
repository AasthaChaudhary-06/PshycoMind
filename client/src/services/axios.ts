import axios from 'axios';
import { store } from '@/store/store';
import { setSession } from '@/features/auth/authSlice';
import { logout } from '@/features/auth/authThunk';

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const onTokenRefreshed = (token) => {
  failedQueue.forEach(({ resolve }) => resolve(token));
  failedQueue = [];
};

const onTokenRefreshFailed = (error) => {
  failedQueue.forEach(({ reject }) => reject(error));
  failedQueue = [];
};

const addToQueue = (resolve, reject) => {
  failedQueue.push({ resolve, reject });
};

// Request interceptor — attach JWT access token.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — transparently refresh expired access tokens.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    // Do not attempt to refresh on auth endpoints themselves.
    if (original.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addToQueue(resolve, reject);
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      const { accessToken, refreshToken, user } = data.data;

      store.dispatch(setSession({ accessToken, refreshToken, user }));

      onTokenRefreshed(accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(original);
    } catch (refreshError) {
      onTokenRefreshFailed(refreshError);
      store.dispatch(logout());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
