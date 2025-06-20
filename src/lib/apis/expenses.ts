import { apiClient } from "../apiClient";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  project_id: string;
  added_by_user: {
    id: string;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    hashed_password: string;
  };
  created_at: string;
  updated_at: string;
  transaction_approval_status?: string;
  transaction_approved_at?: string;
}

export function getExpensesApi(
  token: string,
  projectId: string
): Promise<{ data: Expense[] }> {
  return apiClient(`/projects/${projectId}/expenses`, { token });
}

// Add expense
export function createExpenseApi(
  token: string,
  projectId: string,
  expenseData: {
    amount: number;
    description: string;
    date: string;
    type: string;
  }
): Promise<Expense> {
  return apiClient(`/projects/${projectId}/expenses`, {
    method: "POST",
    token,
    body: expenseData,
  });
}
