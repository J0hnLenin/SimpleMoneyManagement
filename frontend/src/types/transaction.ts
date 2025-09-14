export interface Transaction {
  id?: number;
  url?: string;
  creation_date: string;
  status: number;
  category: number;
  transaction_type: number;
  absolute_amount: number;
  amount?: number;
  comment?: string;
  status_name?: string;
  category_name?: string;
  transaction_type_name?: string;
  transaction_type_is_positive?: boolean;
}

export interface TransactionForm {
  creation_date: string;
  status: number;
  category: number;
  transaction_type: number;
  absolute_amount: number;
  comment?: string;
}

export interface TransactionValidation {
  creation_date: string[];
  status: string[];
  category: string[];
  transaction_type: string[];
  absolute_amount: string[];
  comment: string[];
}