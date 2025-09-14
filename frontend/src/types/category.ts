import { type TransactionType } from './transactionType';

export interface Category {
  id?: number;
  url?: string;
  name: string;
  parent: number | null;
  parent_name: string | null;
  transaction_type: number;
  transaction_type_name?: string;
  is_active: boolean;
  subcategories?: string[];
}

export interface CategoryForm {
  name: string;
  parent: number | null;
  transaction_type: number;
  is_active: boolean;
}

export interface CategoryValidation {
  name: string[];
  parent: string[];
  transaction_type: string[];
  is_active: string[];
}

export interface CategoryTreeItem extends Category {
  children?: CategoryTreeItem[];
  level: number;
}