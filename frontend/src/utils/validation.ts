import { type StatusForm, type StatusValidation } from '@/types/status';
import { type TransactionTypeForm, type TransactionTypeValidation } from '@/types/transactionType';
import { type Category, type CategoryForm, type CategoryValidation } from '@/types/category';
import { type TransactionForm, type TransactionValidation } from '@/types/transaction';

export const validateStatus = (form: StatusForm): StatusValidation => {
  const errors: StatusValidation = {
    name: [],
    is_active: []
  };

  if (!form.name.trim()) {
    errors.name.push('Название статуса обязательно');
  }

  if (form.name.length > 255) {
    errors.name.push('Название не должно превышать 255 символов');
  }

  return errors;
};

export const validateTransactionType = (form: TransactionTypeForm): TransactionTypeValidation => {
  const errors: TransactionTypeValidation = {
    name: [],
    is_active: [],
    is_positive: []
  };

  if (!form.name.trim()) {
    errors.name.push('Название типа операции обязательно');
  }

  if (form.name.length > 255) {
    errors.name.push('Название не должно превышать 255 символов');
  }

  return errors;
};

export const validateCategory = (
  form: CategoryForm, 
  isSubcategory: boolean = false,
  parentCategory: Category | null = null
): CategoryValidation => {
  const errors: CategoryValidation = {
    name: [],
    parent: [],
    transaction_type: [],
    is_active: []
  };

  // Валидация названия
  if (!form.name.trim()) {
    errors.name.push('Название категории обязательно');
  }

  if (form.name.length > 255) {
    errors.name.push('Название не должно превышать 255 символов');
  }

  // Валидация типа транзакции
  if (!form.transaction_type) {
    errors.transaction_type.push('Тип транзакции обязателен');
  }

  // Валидация для подкатегорий
  if (isSubcategory) {
    if (!form.parent) {
      errors.parent.push('Родительская категория обязательна для подкатегорий');
    }

    // Проверка соответствия типа транзакции родителя и подкатегории
    if (form.parent && parentCategory && form.transaction_type) {
      if (parentCategory.transaction_type !== form.transaction_type) {
        errors.transaction_type.push('Тип транзакции подкатегории должен совпадать с типом транзакции родительской категории');
      }
    }
  }

  return errors;
};

export const validateTransaction = (form: TransactionForm): TransactionValidation => {
  const errors: TransactionValidation = {
    creation_date: [],
    status: [],
    category: [],
    transaction_type: [],
    absolute_amount: [],
    comment: []
  };

  // Валидация даты
  if (!form.creation_date) {
    errors.creation_date.push('Дата обязательна');
  } else {
    const date = new Date(form.creation_date);
  }

  // Валидация статуса
  if (!form.status) {
    errors.status.push('Статус обязателен');
  }

  // Валидация категории
  if (!form.category) {
    errors.category.push('Категория обязательна');
  }

  // Валидация типа транзакции
  if (!form.transaction_type) {
    errors.transaction_type.push('Тип транзакции обязателен');
  }

  // Валидация суммы
  if (!form.absolute_amount) {
    errors.absolute_amount.push('Сумма обязательна');
  } else {
    const amount = parseFloat(form.absolute_amount.toString());
    if (isNaN(amount)) {
      errors.absolute_amount.push('Сумма должна быть числом');
    } else if (amount <= 0) {
      errors.absolute_amount.push('Сумма должна быть больше 0');
    } else if (amount > 1000000000) {
      errors.absolute_amount.push('Сумма слишком большая');
    }
  }

  return errors;
};

export const hasTransactionValidationErrors = (errors: TransactionValidation): boolean => {
  return Object.values(errors).some(errorArray => errorArray.length > 0);
};

export const hasCategoryValidationErrors = (errors: CategoryValidation): boolean => {
  return Object.values(errors).some(errorArray => errorArray.length > 0);
};

export const hasTransactionTypeValidationErrors = (errors: TransactionTypeValidation): boolean => {
  return Object.values(errors).some(errorArray => errorArray.length > 0);
};

export const hasStatusValidationErrors = (errors: StatusValidation): boolean => {
  return Object.values(errors).some(errorArray => errorArray.length > 0);
};