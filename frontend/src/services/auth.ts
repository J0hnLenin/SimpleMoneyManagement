import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface LoginData {
  username: string;
  password: string;
}

class AuthService {
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/token/', loginData);
      const token = response.data.access;
      
      if (token) {
        localStorage.setItem('token', token);
        // Обновляем заголовок для всех последующих запросов
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      return response.data;
    } catch (error) {
      throw new Error('Ошибка авторизации');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();