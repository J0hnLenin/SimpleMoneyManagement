import { apiClient } from '@/services/auth';
import { type Category, type CategoryForm } from '@/types/category';

const CATEGORIES_URL = '/transactions/categories/';

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get(CATEGORIES_URL);
      return response.data.results;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await apiClient.get(`${CATEGORIES_URL}${id}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error fetching category:', error);
      throw error;
    }
  }

   async createCategory(categoryData: CategoryForm): Promise<Category> {
    try {
      const dataToSend = {
        ...categoryData,
        transaction_type: categoryData.transaction_type,
        parent: categoryData.parent ? categoryData.parent : null
      };
      
      const response = await apiClient.post(CATEGORIES_URL, dataToSend);
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

  async updateCategory(id: number, categoryData: CategoryForm): Promise<Category> {
    try {
      const dataToSend = {
        ...categoryData,
        transaction_type: categoryData.transaction_type,
        parent: categoryData.parent ? categoryData.parent : null
      };
      
      const response = await apiClient.put(`${CATEGORIES_URL}${id}/`, dataToSend);
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

  async deleteCategory(id: number): Promise<void> {
    try {
      await apiClient.delete(`${CATEGORIES_URL}${id}/`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async toggleCategory(id: number, isActive: boolean): Promise<Category> {
    try {
      const response = await apiClient.patch(`${CATEGORIES_URL}${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.handleUnauthorized();
      }
      console.error('Error toggling category:', error);
      throw error;
    }
  }

  async getMainCategories(): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      return allCategories.filter(category => category.parent === null);
    } catch (error) {
      console.error('Error fetching main categories:', error);
      throw error;
    }
  }

  async getSubcategories(parentId: number): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      return allCategories.filter(category => category.parent === parentId);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }

  buildCategoryTree(categories: Category[]): any[] {
    const categoryMap = new Map<number, any>();
    const tree: any[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id!, {
        ...category,
        children: [],
        level: 0
      });
    });

    categories.forEach(category => {
      if (category.parent !== null) {
        const parent = categoryMap.get(category.parent);
        if (parent) {
          const child = categoryMap.get(category.id!);
          child.level = parent.level + 1;
          parent.children.push(child);
        }
      } else {
        tree.push(categoryMap.get(category.id!));
      }
    });

    return tree;
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

export default new CategoryService();