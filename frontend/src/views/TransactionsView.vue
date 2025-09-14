<template>
  <div class="transactions-page">
    <div class="page-header">
      <h1>Движения денежных средств</h1>
      <p>Управление денежными операциями системы</p>
      <button @click="showCreateModal" class="btn-primary">
        + Добавить транзакцию
      </button>
    </div>

    <!-- Фильтры -->
    <div class="filters-section">
      <h3>Фильтры</h3>
      <div class="filters-grid">
        <div class="filter-group">
          <label>Период дат</label>
          <div class="date-range">
            <input type="date" v-model="filters.start_date" placeholder="Начальная дата">
            <span>—</span>
            <input type="date" v-model="filters.end_date" placeholder="Конечная дата">
          </div>
        </div>

        <div class="filter-group">
          <label>Статус</label>
          <select v-model="filters.status">
            <option :value="null">Все статусы</option>
            <option v-for="status in statuses" :key="status.id" :value="status.id">
              {{ status.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Тип операции</label>
          <select v-model="filters.transaction_type">
            <option :value="null">Все типы</option>
            <option v-for="type in transactionTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Категория</label>
          <select v-model="filters.category">
            <option :value="null">Все категории</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="filter-actions">
          <button @click="applyFilters" class="btn-primary">Применить</button>
          <button @click="resetFilters" class="btn-secondary">Сбросить</button>
        </div>
      </div>
    </div>

    <!-- Таблица транзакций -->
    <div class="table-container" v-if="filteredTransactions.length > 0">
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Категория</th>
            <th>Тип операции</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Комментарий</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in filteredTransactions" :key="transaction.id">
            <td>{{ formatDate(transaction.creation_date) }}</td>
            <td>{{ getCategoryName(transaction.category) }}</td>
            <td>{{ getTransactionTypeName(transaction.transaction_type) }}</td>
            <td :class="(transaction.amount || 0) >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(transaction.amount || 0) }}
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(transaction.status)">
                {{ getStatusName(transaction.status) }}
              </span>
            </td>
            <td class="comment-cell">
              <span v-if="transaction.comment" :title="transaction.comment">
                {{ truncateComment(transaction.comment) }}
              </span>
              <span v-else class="no-comment">—</span>
            </td>
            <td class="actions">
              <button @click="editTransaction(transaction)" class="btn-sm btn-info">
                Редактировать
              </button>
              <button @click="confirmDelete(transaction)" class="btn-sm btn-danger">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <p>Транзакции не найдены</p>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal large-modal">
        <div class="modal-header">
          <h2>{{ editingTransaction ? 'Редактировать транзакцию' : 'Создать транзакцию' }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-row">
              <div class="form-group">
                <label for="creation_date">Дата операции *</label>
                <input
                  type="date"
                  id="creation_date"
                  v-model="form.creation_date"
                  :class="{ 'error': validationErrors.creation_date.length > 0 }"
                />
                <div v-if="validationErrors.creation_date.length > 0" class="error-messages">
                  <span v-for="error in validationErrors.creation_date" :key="error">{{ error }}</span>
                </div>
              </div>

              <div class="form-group">
                <label for="absolute_amount">Сумма (руб) *</label>
                <input
                  type="number"
                  id="absolute_amount"
                  v-model="form.absolute_amount"
                  step="0.01"
                  min="0.01"
                  :class="{ 'error': validationErrors.absolute_amount.length > 0 }"
                  placeholder="0.00"
                />
                <div v-if="validationErrors.absolute_amount.length > 0" class="error-messages">
                  <span v-for="error in validationErrors.absolute_amount" :key="error">{{ error }}</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="transaction_type">Тип операции *</label>
                <select
                  id="transaction_type"
                  v-model="form.transaction_type"
                  :class="{ 'error': validationErrors.transaction_type.length > 0 }"
                  @change="updateCategoriesByType"
                >
                  <option :value="null">Выберите тип операции</option>
                  <option v-for="type in transactionTypes" :key="type.id" :value="type.id">
                    {{ type.name }} ({{ type.is_positive ? '+' : '-' }})
                  </option>
                </select>
                <div v-if="validationErrors.transaction_type.length > 0" class="error-messages">
                  <span v-for="error in validationErrors.transaction_type" :key="error">{{ error }}</span>
                </div>
              </div>

              <div class="form-group">
                <label for="category">Категория *</label>
                <select
                  id="category"
                  v-model="form.category"
                  :class="{ 'error': validationErrors.category.length > 0 }"
                  :disabled="!form.transaction_type"
                >
                  <option :value="null">Выберите категорию</option>
                  <option 
                    v-for="cat in filteredCategories" 
                    :key="cat.id" 
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
                <div v-if="validationErrors.category.length > 0" class="error-messages">
                  <span v-for="error in validationErrors.category" :key="error">{{ error }}</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="status">Статус *</label>
                <select
                  id="status"
                  v-model="form.status"
                  :class="{ 'error': validationErrors.status.length > 0 }"
                >
                  <option :value="null">Выберите статус</option>
                  <option v-for="status in statuses" :key="status.id" :value="status.id">
                    {{ status.name }}
                  </option>
                </select>
                <div v-if="validationErrors.status.length > 0" class="error-messages">
                  <span v-for="error in validationErrors.status" :key="error">{{ error }}</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="comment">Комментарий</label>
              <textarea
                id="comment"
                v-model="form.comment"
                rows="3"
                :class="{ 'error': validationErrors.comment.length > 0 }"
                placeholder="Необязательное поле"
                maxlength="1000"
              ></textarea>
              <div v-if="validationErrors.comment.length > 0" class="error-messages">
                <span v-for="error in validationErrors.comment" :key="error">{{ error }}</span>
              </div>
              <div class="char-count" v-if="form.comment">
                {{ form.comment.length }}/1000 символов
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Отмена
              </button>
              <button type="submit" :disabled="isSubmitting" class="btn-primary">
                {{ isSubmitting ? 'Сохранение...' : (editingTransaction ? 'Обновить' : 'Создать') }}
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
          <p>Вы уверены, что хотите удалить транзакцию от {{ transactionToDelete ? formatDate(transactionToDelete.creation_date) : '' }}?</p>
          <p>Сумма: <strong>{{ transactionToDelete ? formatCurrency(transactionToDelete.amount || 0) : '' }}</strong></p>
          <p>Категория: <strong>{{ transactionToDelete ? getCategoryName(transactionToDelete.category) : '' }}</strong></p>
          <div class="modal-actions">
            <button @click="closeDeleteModal" class="btn-secondary">Отмена</button>
            <button @click="deleteTransaction" class="btn-danger">Удалить</button>
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
import { defineComponent, ref, onMounted, reactive, computed } from 'vue';
import transactionService from '@/services/transactionService';
import statusService from '@/services/statusService';
import categoryService from '@/services/categoryService';
import transactionTypeService from '@/services/transactionTypeService';
import { type Transaction, type TransactionForm, type TransactionValidation } from '@/types/transaction';
import { type Status } from '@/types/status';
import { type Category } from '@/types/category';
import { type TransactionType } from '@/types/transactionType';
import { validateTransaction, hasTransactionValidationErrors } from '@/utils/validation';

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface Filters {
  start_date: string | null;
  end_date: string | null;
  status: number | null;
  transaction_type: number | null;
  category: number | null;
}

export default defineComponent({
  name: 'TransactionsView',
  
  setup() {
    const transactions = ref<Transaction[]>([]);
    const statuses = ref<Status[]>([]);
    const categories = ref<Category[]>([]);
    const transactionTypes = ref<TransactionType[]>([]);
    const isModalOpen = ref(false);
    const isDeleteModalOpen = ref(false);
    const isSubmitting = ref(false);
    const editingTransaction = ref<Transaction | null>(null);
    const transactionToDelete = ref<Transaction | null>(null);

    const filters = reactive<Filters>({
      start_date: null,
      end_date: null,
      status: null,
      transaction_type: null,
      category: null
    });

    const form = reactive<TransactionForm>({
      creation_date: new Date().toISOString().split('T')[0],
      status: null as unknown as number,
      category: null as unknown as number,
      transaction_type: null as unknown as number,
      absolute_amount: 0,
      comment: ''
    });

    const validationErrors = reactive<TransactionValidation>({
      creation_date: [],
      status: [],
      category: [],
      transaction_type: [],
      absolute_amount: [],
      comment: []
    });

    const notification = reactive<Notification>({
      show: false,
      message: '',
      type: 'success'
    });

    // Отфильтрованные транзакции
    const filteredTransactions = computed(() => {
      return transactions.value.filter(transaction => {
        // Фильтр по дате
        if (filters.start_date && new Date(transaction.creation_date) < new Date(filters.start_date)) {
          return false;
        }
        if (filters.end_date && new Date(transaction.creation_date) > new Date(filters.end_date)) {
          return false;
        }
        
        // Фильтр по статусу
        if (filters.status !== null && transaction.status !== filters.status) {
          return false;
        }
        
        // Фильтр по типу операции
        if (filters.transaction_type !== null && transaction.transaction_type !== filters.transaction_type) {
          return false;
        }
        
        // Фильтр по категории
        if (filters.category !== null && transaction.category !== filters.category) {
          return false;
        }
        
        return true;
      });
    });

    // Вспомогательные функции для получения названий
    const getCategoryName = (categoryId: number) => {
      const category = categories.value.find(cat => cat.id === categoryId);
      return category ? category.name : 'Неизвестно';
    };

    const getTransactionTypeName = (typeId: number) => {
      const type = transactionTypes.value.find(t => t.id === typeId);
      return type ? type.name : 'Неизвестно';
    };

    const getStatusName = (statusId: number) => {
      const status = statuses.value.find(s => s.id === statusId);
      return status ? status.name : 'Неизвестно';
    };

    const getStatusClass = (statusId: number) => {
      const status = statuses.value.find(s => s.id === statusId);
      return status ? `status-${status.name.toLowerCase().replace(' ', '-')}` : '';
    };

    // Загрузка данных
    const loadData = async () => {
      try {
        const [transactionsData, statusesData, categoriesData, typesData] = await Promise.all([
          transactionService.getAllTransactions(),
          statusService.getAllStatuses(),
          categoryService.getAllCategories(),
          transactionTypeService.getAllTransactionTypes()
        ]);
        
        transactions.value = transactionsData;
        statuses.value = statusesData;
        categories.value = categoriesData;
        transactionTypes.value = typesData;
      } catch (error: any) {
        if (error.message === 'Сессия истекла. Пожалуйста, войдите снова.') {
          showNotification('Сессия истекла. Пожалуйста, войдите снова.', 'error');
        } else {
          showNotification('Ошибка при загрузке данных', 'error');
        }
      }
    };

    // Отфильтрованные категории по типу транзакции
    const filteredCategories = computed(() => {
      if (!form.transaction_type) return [];
      return categories.value.filter(cat => cat.transaction_type === form.transaction_type);
    });

    // Утилиты форматирования
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2
      }).format(amount);
    };

    const truncateComment = (comment: string, maxLength: number = 50) => {
      return comment.length > maxLength ? comment.substring(0, maxLength) + '...' : comment;
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

    // Применить фильтры
    const applyFilters = () => {
      // Фильтрация происходит автоматически через computed свойство
    };

    // Сбросить фильтры
    const resetFilters = () => {
      filters.start_date = null;
      filters.end_date = null;
      filters.status = null;
      filters.transaction_type = null;
      filters.category = null;
    };

    // Открыть модальное окно создания
    const showCreateModal = () => {
      editingTransaction.value = null;
      form.creation_date = new Date().toISOString().split('T')[0];
      form.status = null as unknown as number;
      form.category = null as unknown as number;
      form.transaction_type = null as unknown as number;
      form.absolute_amount = 0;
      form.comment = '';
      resetValidationErrors();
      isModalOpen.value = true;
    };

    // Обновить категории при изменении типа транзакции
    const updateCategoriesByType = () => {
      form.category = null as unknown as number;
    };

    // Открыть модальное окно редактирования
    const editTransaction = (transaction: Transaction) => {
      editingTransaction.value = transaction;
      form.creation_date = transaction.creation_date.split('T')[0];
      form.status = transaction.status;
      form.category = transaction.category;
      form.transaction_type = transaction.transaction_type;
      form.absolute_amount = transaction.absolute_amount;
      form.comment = transaction.comment || '';
      resetValidationErrors();
      isModalOpen.value = true;
    };

    // Закрыть модальное окно
    const closeModal = () => {
      isModalOpen.value = false;
      editingTransaction.value = null;
      resetValidationErrors();
    };

    // Сброс ошибок валидации
    const resetValidationErrors = () => {
      Object.keys(validationErrors).forEach(key => {
        validationErrors[key as keyof TransactionValidation] = [];
      });
    };

    // Отправка формы
    const submitForm = async () => {
      resetValidationErrors();
      
      const errors = validateTransaction(form);
      if (hasTransactionValidationErrors(errors)) {
        Object.assign(validationErrors, errors);
        return;
      }

      isSubmitting.value = true;

      try {
        if (editingTransaction.value) {
          await transactionService.updateTransaction(editingTransaction.value.id!, form);
          showNotification('Транзакция успешно обновлена');
        } else {
          await transactionService.createTransaction(form);
          showNotification('Транзакция успешно создана');
        }
        
        await loadData();
        closeModal();
      } catch (error: any) {
        if (error.response?.data) {
          Object.keys(error.response.data).forEach(key => {
            if (key in validationErrors) {
              validationErrors[key as keyof TransactionValidation] = 
                Array.isArray(error.response.data[key]) 
                  ? error.response.data[key] 
                  : [error.response.data[key]];
            }
          });
        }
        showNotification('Ошибка при сохранении транзакции', 'error');
      } finally {
        isSubmitting.value = false;
      }
    };

    // Подтверждение удаления
    const confirmDelete = (transaction: Transaction) => {
      transactionToDelete.value = transaction;
      isDeleteModalOpen.value = true;
    };

    // Закрыть модальное окно удаления
    const closeDeleteModal = () => {
      isDeleteModalOpen.value = false;
      transactionToDelete.value = null;
    };

    // Удаление транзакции
    const deleteTransaction = async () => {
      if (!transactionToDelete.value) return;

      try {
        await transactionService.deleteTransaction(transactionToDelete.value.id!);
        showNotification('Транзакция успешно удалена');
        await loadData();
        closeDeleteModal();
      } catch (error: any) {
        if (error.message === 'Сессия истекла. Пожалуйста, войдите снова.') {
          showNotification('Сессия истекла. Пожалуйста, войдите снова.', 'error');
        } else {
          showNotification('Ошибка при удалении транзакции', 'error');
        }
      }
    };

    onMounted(() => {
      loadData();
    });

    return {
      filteredTransactions,
      statuses,
      categories,
      transactionTypes,
      filteredCategories,
      isModalOpen,
      isDeleteModalOpen,
      isSubmitting,
      editingTransaction,
      transactionToDelete,
      form,
      validationErrors,
      notification,
      filters,
      showCreateModal,
      editTransaction,
      closeModal,
      submitForm,
      updateCategoriesByType,
      confirmDelete,
      closeDeleteModal,
      deleteTransaction,
      formatDate,
      formatCurrency,
      truncateComment,
      applyFilters,
      resetFilters,
      getCategoryName,
      getTransactionTypeName,
      getStatusName,
      getStatusClass
    };
  }
});
</script>

<style scoped>
.transactions-page {
  padding: 2rem;
  min-height: calc(100vh - 120px);
  background-color: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
}

.page-header p {
  color: #7f8c8d;
  margin: 0;
  flex: 1;
  min-width: 100%;
}

/* Стили для фильтров */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.filters-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-range input {
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-self: end;
}

/* Таблица */
.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.transactions-table th,
.transactions-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.transactions-table th {
  background-color: #34495e;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.transactions-table tr:hover {
  background-color: #f8f9fa;
}

.transactions-table td.positive {
  color: #28a745;
  font-weight: 600;
}

.transactions-table td.negative {
  color: #dc3545;
  font-weight: 600;
}

.comment-cell {
  max-width: 200px;
}

.no-comment {
  color: #6c757d;
  font-style: italic;
}

/* Бейджи статусов */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-success { background-color: #d4edda; color: #155724; }
.status-pending { background-color: #fff3cd; color: #856404; }
.status-cancelled { background-color: #f8d7da; color: #721c24; }

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.large-modal {
  width: 600px;
  max-width: 95%;
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
  color: #7f8c8d;
}

.modal-body {
  padding: 1.5rem;
}

/* Формы */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #dc3545;
}

.error-messages {
  color: #dc3545;
  font-size: 0.8rem;
}

.char-count {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: right;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ecf0f1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Кнопки */
.btn-primary, .btn-secondary, .btn-danger, .btn-info {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* Уведомления */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  color: white;
  font-weight: 500;
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

/* Состояния */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .transactions-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .transactions-table {
    font-size: 0.8rem;
  }
  
  .transactions-table th,
  .transactions-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .modal {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .filter-actions {
    flex-direction: column;
  }
  
  .actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .transactions-table {
    display: block;
    overflow-x: auto;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-header {
    padding: 1rem;
  }
}
</style>