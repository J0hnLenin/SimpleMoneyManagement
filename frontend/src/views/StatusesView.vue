<template>
  <div class="statuses-page">
    <div class="page-header">
      <h1>Статусы транзакций</h1>
      <p>Управление статусами транзакций системы</p>
      <button @click="showCreateModal" class="btn-primary">
        + Добавить статус
      </button>
    </div>

    <!-- Таблица статусов -->
    <div class="table-container" v-if="statuses.length > 0">
      <table class="statuses-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="status in statuses" :key="status.id" 
              :class="{ 'inactive': !status.is_active }">
            <td>{{ status.id }}</td>
            <td>{{ status.name }}</td>
            <td>
              <span class="status-badge" :class="{ 'active': status.is_active, 'inactive': !status.is_active }">
                {{ status.is_active ? 'Активен' : 'Неактивен' }}
              </span>
            </td>
            <td class="actions">
              <button @click="toggleStatus(status)" class="btn-sm" 
                      :class="status.is_active ? 'btn-warning' : 'btn-success'">
                {{ status.is_active ? 'Деактивировать' : 'Активировать' }}
              </button>
              <button @click="editStatus(status)" class="btn-sm btn-info">
                Редактировать
              </button>
              <button @click="confirmDelete(status)" class="btn-sm btn-danger">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <p>Статусы не найдены</p>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingStatus ? 'Редактировать статус' : 'Создать статус' }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">Название статуса *</label>
              <input
                type="text"
                id="name"
                v-model="form.name"
                :class="{ 'error': validationErrors.name.length > 0 }"
                placeholder="Введите название статуса"
              />
              <div v-if="validationErrors.name.length > 0" class="error-messages">
                <span v-for="error in validationErrors.name" :key="error">{{ error }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.is_active" />
                <span class="checkmark"></span>
                Активный статус
              </label>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Отмена
              </button>
              <button type="submit" :disabled="isSubmitting" class="btn-primary">
                {{ isSubmitting ? 'Сохранение...' : (editingStatus ? 'Обновить' : 'Создать') }}
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
          <p>Вы уверены, что хотите удалить статус "{{ statusToDelete?.name }}"?</p>
          <div class="modal-actions">
            <button @click="closeDeleteModal" class="btn-secondary">Отмена</button>
            <button @click="deleteStatus" class="btn-danger">Удалить</button>
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
import { defineComponent, ref, onMounted, reactive } from 'vue';
import statusService from '@/services/statusService';
import { type Status, type StatusForm, type StatusValidation } from '@/types/status';
import { validateStatus, hasStatusValidationErrors } from '@/utils/validation';

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default defineComponent({
  name: 'StatusesView',
  
  setup() {
    const statuses = ref<Status[]>([]);
    const isModalOpen = ref(false);
    const isDeleteModalOpen = ref(false);
    const isSubmitting = ref(false);
    const editingStatus = ref<Status | null>(null);
    const statusToDelete = ref<Status | null>(null);

    const form = reactive<StatusForm>({
      name: '',
      is_active: true
    });

    const validationErrors = reactive<StatusValidation>({
      name: [],
      is_active: []
    });

    const notification = reactive<Notification>({
      show: false,
      message: '',
      type: 'success'
    });

    // Загрузка статусов
    const loadStatuses = async () => {
      try {
        statuses.value = await statusService.getAllStatuses();
      } catch (error) {
        showNotification('Ошибка при загрузке статусов', 'error');
      }
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
    const showCreateModal = () => {
      editingStatus.value = null;
      form.name = '';
      form.is_active = true;
      resetValidationErrors();
      isModalOpen.value = true;
    };

    // Открыть модальное окно редактирования
    const editStatus = (status: Status) => {
      editingStatus.value = status;
      form.name = status.name;
      form.is_active = status.is_active;
      resetValidationErrors();
      isModalOpen.value = true;
    };

    // Закрыть модальное окно
    const closeModal = () => {
      isModalOpen.value = false;
      editingStatus.value = null;
      resetValidationErrors();
    };

    // Сброс ошибок валидации
    const resetValidationErrors = () => {
      validationErrors.name = [];
      validationErrors.is_active = [];
    };

    // Отправка формы
    const submitForm = async () => {
      resetValidationErrors();
      
      const errors = validateStatus(form);
      if (hasStatusValidationErrors(errors)) {
        Object.assign(validationErrors, errors);
        return;
      }

      isSubmitting.value = true;

      try {
        if (editingStatus.value) {
          await statusService.updateStatus(editingStatus.value.id!, form);
          showNotification('Статус успешно обновлен');
        } else {
          await statusService.createStatus(form);
          showNotification('Статус успешно создан');
        }
        
        await loadStatuses();
        closeModal();
      } catch (error: any) {
        if (error.name) {
          validationErrors.name = Array.isArray(error.name) ? error.name : [error.name];
        }
        showNotification('Ошибка при сохранении статуса', 'error');
      } finally {
        isSubmitting.value = false;
      }
    };

    // Переключение статуса активности
    const toggleStatus = async (status: Status) => {
      try {
        await statusService.toggleStatus(status.id!, !status.is_active);
        showNotification('Статус успешно обновлен');
        await loadStatuses();
      } catch (error) {
        showNotification('Ошибка при обновлении статуса', 'error');
      }
    };

    // Подтверждение удаления
    const confirmDelete = (status: Status) => {
      statusToDelete.value = status;
      isDeleteModalOpen.value = true;
    };

    // Закрыть модальное окно удаления
    const closeDeleteModal = () => {
      isDeleteModalOpen.value = false;
      statusToDelete.value = null;
    };

    // Удаление статуса
    const deleteStatus = async () => {
      if (!statusToDelete.value) return;

      try {
        await statusService.deleteStatus(statusToDelete.value.id!);
        showNotification('Статус успешно удален');
        await loadStatuses();
        closeDeleteModal();
      } catch (error) {
        showNotification('Ошибка при удалении статуса', 'error');
      }
    };

    onMounted(() => {
      loadStatuses();
    });

    return {
      statuses,
      isModalOpen,
      isDeleteModalOpen,
      isSubmitting,
      editingStatus,
      statusToDelete,
      form,
      validationErrors,
      notification,
      showCreateModal,
      editStatus,
      closeModal,
      submitForm,
      toggleStatus,
      confirmDelete,
      closeDeleteModal,
      deleteStatus
    };
  }
});
</script>

<style scoped>
.statuses-page {
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

.page-header h1 {
  color: #2c3e50;
  margin: 0;
}

.page-header p {
  color: #7f8c8d;
  margin: 0;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.statuses-table {
  width: 100%;
  border-collapse: collapse;
}

.statuses-table th,
.statuses-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.statuses-table th {
  background-color: #34495e;
  color: white;
  font-weight: 600;
}

.statuses-table tr:hover {
  background-color: #f8f9fa;
}

.statuses-table tr.inactive {
  opacity: 0.6;
  background-color: #f8f9fa;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
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