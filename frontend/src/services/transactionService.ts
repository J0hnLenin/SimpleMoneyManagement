import { apiClient } from '@/services/auth';
import { type Transaction, type TransactionForm } from '@/types/transaction';

const TRANSACTIONS_URL = '/transactions/transactions/';

class TransactionService {
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiClient.get(TRANSACTIONS_URL);
      return response.data.results;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransactionById(id: number): Promise<Transaction> {
    try {
      const response = await apiClient.get(`${TRANSACTIONS_URL}${id}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async createTransaction(transactionData: TransactionForm): Promise<Transaction> {
    try {
      const response = await apiClient.post(TRANSACTIONS_URL, transactionData);
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

  async updateTransaction(id: number, transactionData: TransactionForm): Promise<Transaction> {
    try {
      const response = await apiClient.put(`${TRANSACTIONS_URL}${id}/`, transactionData);
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

  async deleteTransaction(id: number): Promise<void> {
    try {
      await apiClient.delete(`${TRANSACTIONS_URL}${id}/`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await apiClient.get(TRANSACTIONS_URL, {
        params: {
          creation_date__gte: startDate,
          creation_date__lte: endDate
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error fetching transactions by date range:', error);
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

export default new TransactionService();