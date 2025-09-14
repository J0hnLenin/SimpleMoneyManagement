export interface TransactionType {
  id?: number;
  url?: string;
  name: string;
  is_active: boolean;
  is_positive: boolean;
}

export interface TransactionTypeForm {
  name: string;
  is_active: boolean;
  is_positive: boolean;
}

export interface TransactionTypeValidation {
  name: string[];
  is_active: string[];
  is_positive: string[];
}