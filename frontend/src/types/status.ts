export interface Status {
  id?: number;
  url?: string;
  name: string;
  is_active: boolean;
}

export interface StatusForm {
  name: string;
  is_active: boolean;
}

export interface StatusValidation {
  name: string[];
  is_active: string[];
}