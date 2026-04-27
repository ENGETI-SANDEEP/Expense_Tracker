export interface Expense {
  id: string;
  amount: number; // in cents
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

const API_URL = 'http://localhost:3001';

export const api = {
  async getExpenses(category?: string, sort: 'date_desc' | 'date_asc' = 'date_desc'): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('sort', sort);

    const res = await fetch(`${API_URL}/expenses?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    
    const data = await res.json();
    return data.data;
  },

  async createExpense(expenseData: {
    amount: number;
    category: string;
    description?: string;
    date: string;
  }, idempotencyKey: string): Promise<Expense> {
    const res = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(expenseData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create expense');
    }

    const data = await res.json();
    return data.data;
  },

  async updateExpense(id: string, expenseData: {
    amount: number;
    category: string;
    description?: string;
    date: string;
  }): Promise<Expense> {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update expense');
    }

    const data = await res.json();
    return data.data;
  },

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete expense');
    }
  }
};
