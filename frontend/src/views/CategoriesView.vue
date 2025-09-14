<template>
  <div class="categories-page">
    <div class="page-header">
      <h1>Категории транзакций</h1>
      <p>Управление иерархией категорий системы</p>
      <div class="header-actions">
        <button @click="showCreateModal(null)" class="btn-primary">
          + Добавить категорию
        </button>
        <button @click="showCreateModal(null, true)" class="btn-secondary">
          + Добавить подкатегорию
        </button>
      </div>
    </div>

    <!-- Дерево категорий -->
    <div class="categories-tree" v-if="categoriesTree.length > 0">
      <div v-for="category in categoriesTree" :key="category.id" class="tree-item">
        <div class="category-item" :class="{ 'inactive': !category.is_active, 'level-0': category.level === 0 }">
          <div class="category-info">
            <span class="category-name">{{ category.name }}</span>
            <span class="category-type" :class="getTransactionTypeClass(category.transaction_type)">
              {{ getTransactionTypeName(category.transaction_type) }}
            </span>
            <span class="status-badge" :class="{ 'active': category.is_active, 'inactive': !category.is_active }">
              {{ category.is_active ? 'Активна' : 'Неактивна' }}
            </span>
          </div>
          <div class="category-actions">
            <button @click="toggleCategory(category)" class="btn-sm" 
                    :class="category.is_active ? 'btn-warning' : 'btn-success'">
              {{ category.is_active ? 'Деактивировать' : 'Активировать' }}
            </button>
            <button @click="editCategory(category)" class="btn-sm btn-info">
              Редактировать
            </button>
            <button @click="showCreateModal(category.id)" class="btn-sm btn-primary">
              + Подкатегория
            </button>
            <button @click="confirmDelete(category)" class="btn-sm btn-danger">
              Удалить
            </button>
          </div>
        </div>

        <!-- Подкатегории -->
        <div v-if="category.children && category.children.length > 0" class="subcategories">
          <div v-for="subcategory in category.children" :key="subcategory.id" class="tree-item level-1">
            <div class="category-item" :class="{ 'inactive': !subcategory.is_active }">
              <div class="category-info">
                <span class="subcategory-indent">↳ </span>
                <span class="category-name">{{ subcategory.name }}</span>
                <span class="category-type" :class="getTransactionTypeClass(subcategory.transaction_type)">
                  {{ getTransactionTypeName(subcategory.transaction_type) }}
                </span>
                <span class="status-badge" :class="{ 'active': subcategory.is_active, 'inactive': !subcategory.is_active }">
                  {{ subcategory.is_active ? 'Активна' : 'Неактивна' }}
                </span>
              </div>
              <div class="category-actions">
                <button @click="toggleCategory(subcategory)" class="btn-sm" 
                        :class="subcategory.is_active ? 'btn-warning' : 'btn-success'">
                  {{ subcategory.is_active ? 'Деактивировать' : 'Активировать' }}
                </button>
                <button @click="editCategory(subcategory)" class="btn-sm btn-info">
                  Редактировать
                </button>
                <button @click="confirmDelete(subcategory)" class="btn-sm btn-danger">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Категории не найдены</p>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal large-modal">
        <div class="modal-header">
          <h2>{{ editingCategory ? 'Редактировать категорию' : (isSubcategory ? 'Создать подкатегорию' : 'Создать категорию') }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">Название категории *</label>
              <input
                type="text"
                id="name"
                v-model="form.name"
                :class="{ 'error': validationErrors.name.length > 0 }"
                :placeholder="isSubcategory ? 'Введите название подкатегории' : 'Введите название категории'"
              />
              <div v-if="validationErrors.name.length > 0" class="error-messages">
                <span v-for="error in validationErrors.name" :key="error">{{ error }}</span>
              </div>
            </div>

            <div class="form-group" v-if="isSubcategory">
              <label for="parent">Родительская категория *</label>
              <select
                id="parent"
                v-model="form.parent"
                :class="{ 'error': validationErrors.parent.length > 0 }"
              >
                <option :value="null">Выберите категорию</option>
                <option v-for="category in mainCategories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <div v-if="validationErrors.parent.length > 0" class="error-messages">
                <span v-for="error in validationErrors.parent" :key="error">{{ error }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="transaction_type">Тип транзакции *</label>
              <select
                id="transaction_type"
                v-model="form.transaction_type"
                :class="{ 'error': validationErrors.transaction_type.length > 0 }"
                
              >
                <option :value="null">Выберите тип транзакции</option>
                <option v-for="type in transactionTypes" :key="type.id" :value="type.id">
                  {{ type.name }} ({{ type.is_positive ? '+' : '-' }})
                </option>
              </select>
              <div v-if="validationErrors.transaction_type.length > 0" class="error-messages">
                <span v-for="error in validationErrors.transaction_type" :key="error">{{ error }}</span>
              </div>
              <p v-if="isSubcategory && form.parent" class="help-text">
                Тип транзакции будет унаследован от родительской категории
              </p>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.is_active" />
                <span class="checkmark"></span>
                Активная категория
              </label>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Отмена
              </button>
              <button type="submit" :disabled="isSubmitting" class="btn-primary">
                {{ isSubmitting ? 'Сохранение...' : (editingCategory ? 'Обновить' : 'Создать') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="isDeleteModalOpen" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Подтверждение удаления</h2>
          <button @click="closeDeleteModal" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <p>Вы уверены, что хотите удалить категорию "{{ categoryToDelete?.name }}"?</p>
          <p v-if="categoryToDelete?.subcategories && categoryToDelete.subcategories.length > 0" class="warning-text">
            ⚠️ Внимание: эта категория содержит подкатегории, которые также будут удалены!
          </p>
          <div class="modal-actions">
            <button @click="closeDeleteModal" class="btn-secondary">Отмена</button>
            <button @click="deleteCategory" class="btn-danger">Удалить</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Уведомления -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive, watch } from 'vue';
import categoryService from '@/services/categoryService';
import transactionTypeService from '@/services/transactionTypeService';
import { type Category, type CategoryForm, type CategoryValidation, type CategoryTreeItem } from '@/types/category';
import { type TransactionType } from '@/types/transactionType';
import { validateCategory, hasCategoryValidationErrors } from '@/utils/validation';

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default defineComponent({
  name: 'CategoriesView',
  
  setup() {
    const categories = ref<Category[]>([]);
    const categoriesTree = ref<CategoryTreeItem[]>([]);
    const mainCategories = ref<Category[]>([]);
    const transactionTypes = ref<TransactionType[]>([]);
    const isModalOpen = ref(false);
    const isDeleteModalOpen = ref(false);
    const isSubmitting = ref(false);
    const isSubcategory = ref(false);
    const editingCategory = ref<Category | null>(null);
    const categoryToDelete = ref<Category | null>(null);

    const form = reactive<CategoryForm>({
      name: '',
      parent: null,
      transaction_type: null as unknown as number,
      is_active: true
    });

    const validationErrors = reactive<CategoryValidation>({
      name: [],
      parent: [],
      transaction_type: [],
      is_active: []
    });

    const notification = reactive<Notification>({
      show: false,
      message: '',
      type: 'success'
    });

    // Загрузка данных
    const loadData = async () => {
      try {
        const [categoriesData, typesData] = await Promise.all([
          categoryService.getAllCategories(),
          transactionTypeService.getAllTransactionTypes()
        ]);
        
        categories.value = categoriesData;
        categoriesTree.value = categoryService.buildCategoryTree(categoriesData);
        mainCategories.value = categoriesData.filter(cat => cat.parent === null);
        transactionTypes.value = typesData;
      } catch (error: any) {
        if (error.message === 'Сессия истекла. Пожалуйста, войдите снова.') {
          showNotification('Сессия истекла. Пожалуйста, войдите снова.', 'error');
        } else {
          showNotification('Ошибка при загрузке данных', 'error');
        }
      }
    };

    // Получить название типа транзакции
    const getTransactionTypeName = (typeId: number): string => {
      const type = transactionTypes.value.find(t => t.id === typeId);
      return type ? `${type.name} (${type.is_positive ? '+' : '-'})` : 'Неизвестно';
    };

    // Получить класс для типа транзакции
    const getTransactionTypeClass = (typeId: number): string => {
      const type = transactionTypes.value.find(t => t.id === typeId);
      return type?.is_positive ? 'positive' : 'negative';
    };

    // Показать уведомление
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
      notification.message = message;
      notification.type = type;
      notification.show = true;
      
      setTimeout(() => {
        notification.show = false;
      }, 3000);
    };

    // Открыть модальное окно создания
    const showCreateModal = (parentId: number | null = null, asSubcategory: boolean = false) => {
      editingCategory.value = null;
      isSubcategory.value = asSubcategory || parentId !== null;
      
      form.name = '';
      form.parent = parentId;
      form.transaction_type = null as unknown as number;
      form.is_active = true;

      // Если создаем подкатегорию и указан родитель, наследуем тип транзакции
      if (parentId && asSubcategory) {
        const parentCategory = categories.value.find(cat => cat.id === parentId);
        if (parentCategory) {
          form.transaction_type = parentCategory.transaction_type;
        }
      }

      resetValidationErrors();
      isModalOpen.value = true;
    };

    // Открыть модальное окно редактирования
    const editCategory = (category: Category) => {
      editingCategory.value = category;
      isSubcategory.value = category.parent !== null;
      
      form.name = category.name;
      form.parent = category.parent;
      form.transaction_type = category.transaction_type;
      form.is_active = category.is_active;

      resetValidationErrors();
      isModalOpen.value = true;
    };

    // Наблюдаем за изменением родительской категории
    watch(() => form.parent, (newParentId) => {
      if (newParentId && isSubcategory.value) {
        const parentCategory = categories.value.find(cat => cat.id === newParentId);
        if (parentCategory) {
          form.transaction_type = parentCategory.transaction_type;
        }
      }
    });

    // Закрыть модальное окно
    const closeModal = () => {
      isModalOpen.value = false;
      editingCategory.value = null;
      isSubcategory.value = false;
      resetValidationErrors();
    };

    // Сброс ошибок валидации
    const resetValidationErrors = () => {
      validationErrors.name = [];
      validationErrors.parent = [];
      validationErrors.transaction_type = [];
      validationErrors.is_active = [];
    };

    // Отправка формы
    const submitForm = async () => {
        resetValidationErrors();
        
        // Получаем данные о родительской категории для валидации
        let parentCategoryData: Category | null = null;
        if (form.parent && isSubcategory.value) {
            parentCategoryData = categories.value.find(cat => cat.id === form.parent) || null;
        }
        
        const errors = validateCategory(form, isSubcategory.value, parentCategoryData);
        if (hasCategoryValidationErrors(errors)) {
            Object.assign(validationErrors, errors);
            return;
        }

        isSubmitting.value = true;

        try {
            if (editingCategory.value) {
            await categoryService.updateCategory(editingCategory.value.id!, form);
            showNotification('Категория успешно обновлена');
            } else {
            await categoryService.createCategory(form);
            showNotification('Категория успешно создана');
            }
            
            await loadData();
            closeModal();
        } catch (error: any) {
            // Обработка ошибок сервера
            if (error.name) {
            validationErrors.name = Array.isArray(error.name) ? error.name : [error.name];
            }
            if (error.parent) {
            validationErrors.parent = Array.isArray(error.parent) ? error.parent : [error.parent];
            }
            if (error.transaction_type) {
            validationErrors.transaction_type = Array.isArray(error.transaction_type) ? error.transaction_type : [error.transaction_type];
            }
            showNotification('Ошибка при сохранении категории', 'error');
        } finally {
            isSubmitting.value = false;
        }
    };

    // Переключение статуса активности
    const toggleCategory = async (category: Category) => {
      try {
        await categoryService.toggleCategory(category.id!, !category.is_active);
        showNotification('Категория успешно обновлена');
        await loadData();
      } catch (error: any) {
        if (error.message === 'Сессия истекла. Пожалуйста, войдите снова.') {
          showNotification('Сессия истекла. Пожалуйста, войдите снова.', 'error');
        } else {
          showNotification('Ошибка при обновлении категории', 'error');
        }
      }
    };

    // Подтверждение удаления
    const confirmDelete = (category: Category) => {
      categoryToDelete.value = category;
      isDeleteModalOpen.value = true;
    };

    // Закрыть модальное окно удаления
    const closeDeleteModal = () => {
      isDeleteModalOpen.value = false;
      categoryToDelete.value = null;
    };

    // Удаление категории
    const deleteCategory = async () => {
      if (!categoryToDelete.value) return;

      try {
        await categoryService.deleteCategory(categoryToDelete.value.id!);
        showNotification('Категория успешно удалена');
        await loadData();
        closeDeleteModal();
      } catch (error: any) {
        if (error.message === 'Сессия истекла. Пожалуйста, войдите снова.') {
          showNotification('Сессия истекла. Пожалуйста, войдите снова.', 'error');
        } else {
          showNotification('Ошибка при удалении категории', 'error');
        }
      }
    };

    onMounted(() => {
      loadData();
    });

    return {
      categories,
      categoriesTree,
      mainCategories,
      transactionTypes,
      isModalOpen,
      isDeleteModalOpen,
      isSubmitting,
      isSubcategory,
      editingCategory,
      categoryToDelete,
      form,
      validationErrors,
      notification,
      showCreateModal,
      editCategory,
      closeModal,
      submitForm,
      toggleCategory,
      confirmDelete,
      closeDeleteModal,
      deleteCategory,
      getTransactionTypeName,
      getTransactionTypeClass
    };
  }
});
</script>

<style scoped>
.categories-page {
  padding: 2rem;
  min-height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.categories-tree {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tree-item {
  margin-bottom: 1rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: #f8f9fa;
}

.category-item.level-0 {
  background: #e3f2fd;
  border-color: #bbdefb;
}

.category-item.inactive {
  opacity: 0.6;
  background: #f8f9fa;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-name {
  font-weight: 600;
  color: #2c3e50;
}

.subcategory-indent {
  color: #6c757d;
  font-weight: bold;
}

.category-type {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.category-type.positive {
  background-color: #d4edda;
  color: #155724;
}

.category-type.negative {
  background-color: #f8d7da;
  color: #721c24;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.subcategories {
  margin-left: 2rem;
  margin-top: 0.5rem;
}

.warning-text {
  color: #dc3545;
  font-weight: 500;
  margin: 1rem 0;
}

.large-modal {
  max-width: 600px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .category-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .category-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .category-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .subcategories {
    margin-left: 1rem;
  }
}

/* Кнопки */
.btn-primary, .btn-secondary, .btn-success, .btn-warning, .btn-danger, .btn-info {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #1e7e34;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 1.5rem;
}

/* Формы */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input.error {
  border-color: #dc3545;
}

.error-messages {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-messages span {
  display: block;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 0.5rem;
}

.form-actions, .modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Уведомления */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  color: white;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background-color: #28a745;
}

.notification.error {
  background-color: #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .statuses-table {
    font-size: 0.875rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .form-actions, .modal-actions {
    flex-direction: column;
  }
}
</style>