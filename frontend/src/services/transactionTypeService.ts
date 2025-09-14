import { apiClient } from '@/services/auth';
import { type TransactionType, type TransactionTypeForm } from '@/types/transactionType';

const TRANSACTION_TYPES_URL = '/transactions/transaction-types/';

class TransactionTypeService {
  async getAllTransactionTypes(): Promise<TransactionType[]> {
    try {
      const response = await apiClient.get(TRANSACTION_TYPES_URL);
      return response.data.results;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error fetching transaction types:', error);
      throw error;
    }
  }

  async getTransactionTypeById(id: number): Promise<TransactionType> {
    try {
      const response = await apiClient.get(`${TRANSACTION_TYPES_URL}${id}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error fetching transaction type:', error);
      throw error;
    }
  }

  async createTransactionType(transactionTypeData: TransactionTypeForm): Promise<TransactionType> {
    try {
      const response = await apiClient.post(TRANSACTION_TYPES_URL, transactionTypeData);
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

  async updateTransactionType(id: number, transactionTypeData: TransactionTypeForm): Promise<TransactionType> {
    try {
      const response = await apiClient.put(`${TRANSACTION_TYPES_URL}${id}/`, transactionTypeData);
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

  async deleteTransactionType(id: number): Promise<void> {
    try {
      await apiClient.delete(`${TRANSACTION_TYPES_URL}${id}/`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error deleting transaction type:', error);
      throw error;
    }
  }

  async toggleTransactionType(id: number, isActive: boolean): Promise<TransactionType> {
    try {
      const response = await apiClient.patch(`${TRANSACTION_TYPES_URL}${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error toggling transaction type:', error);
      throw error;
    }
  }

  private handleUnauthorized(): void {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    
    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
  }
}

export default new TransactionTypeService();