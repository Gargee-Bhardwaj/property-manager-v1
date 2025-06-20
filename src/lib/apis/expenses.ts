const BASE_URL = "https://hustle-jldf.onrender.com/api/v1";

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

export async function getExpensesApi(
  token: string,
  projectId: string
): Promise<{ data: Expense[] }> {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/expenses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch expenses");
  }

  return response.json();
}

// Add expense
export async function createExpenseApi(
  token: string,
  projectId: string,
  expenseData: {
    amount: number;
    description: string;
    date: string;
    type: string;
  }
): Promise<Expense> {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create expense");
  }

  return response.json();
}
