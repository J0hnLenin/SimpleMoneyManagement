import { apiClient } from '@/services/auth';
import { type Status, type StatusForm } from '@/types/status';

const STATUSES_URL = '/transactions/statuses/';

class StatusService {
  async getAllStatuses(): Promise<Status[]> {
    try {
      const response = await apiClient.get(STATUSES_URL);
      return response.data.results;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error fetching statuses:', error);
      throw error;
    }
  }

  async getStatusById(id: number): Promise<Status> {
    try {
      const response = await apiClient.get(`${STATUSES_URL}${id}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error fetching status:', error);
      throw error;
    }
  }

  async createStatus(statusData: StatusForm): Promise<Status> {
    try {
      const response = await apiClient.post(STATUSES_URL, statusData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  }

  async updateStatus(id: number, statusData: StatusForm): Promise<Status> {
    try {
      const response = await apiClient.put(`${STATUSES_URL}${id}/`, statusData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  }

  async deleteStatus(id: number): Promise<void> {
    try {
      await apiClient.delete(`${STATUSES_URL}${id}/`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error deleting status:', error);
      throw error;
    }
  }

  async toggleStatus(id: number, isActive: boolean): Promise<Status> {
    try {
      const response = await apiClient.patch(`${STATUSES_URL}${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error toggling status:', error);
      throw error;
    }
  }

  private handleUnauthorized(): void {
    // Очищаем токен и перенаправляем на страницу логина
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    
    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
  }
}

export default new StatusService();