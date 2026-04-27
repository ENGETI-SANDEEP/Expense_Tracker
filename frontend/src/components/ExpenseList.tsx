import { useState } from 'react';
import { api, type Expense } from '../api';
import { Pencil, Trash2, Check, X } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  filterCategory: string;
  onFilterChange: (category: string) => void;
  sortOrder: 'date_desc' | 'date_asc';
  onSortChange: (sort: 'date_desc' | 'date_asc') => void;
  filterDateType: 'all' | 'day' | 'month';
  onFilterDateTypeChange: (type: 'all' | 'day' | 'month') => void;
  filterDateValue: string;
  onFilterDateValueChange: (val: string) => void;
  onExpensesChanged: () => void;
}

export function ExpenseList({
  expenses,
  isLoading,
  filterCategory,
  onFilterChange,
  sortOrder,
  onSortChange,
  filterDateType,
  onFilterDateTypeChange,
  filterDateValue,
  onFilterDateValueChange,
  onExpensesChanged
}: ExpenseListProps) {

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Expense>>({});
  const [isSaving, setIsSaving] = useState(false);

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.deleteExpense(id);
      onExpensesChanged();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const startEditing = (expense: Expense) => {
    setEditingId(expense.id);
    setEditData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (id: string) => {
    if (!editData.amount || !editData.category || !editData.date) {
      alert('Please fill out all required fields');
      return;
    }
    
    setIsSaving(true);
    try {
      await api.updateExpense(id, {
        amount: editData.amount,
        category: editData.category,
        description: editData.description || undefined,
        date: editData.date
      });
      setEditingId(null);
      setEditData({});
      onExpensesChanged();
    } catch (err: any) {
      alert(err.message || 'Failed to update expense');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Recent Expenses</h2>
        <div className="filters">
          <select 
            className="form-control" 
            value={filterCategory} 
            onChange={(e) => onFilterChange(e.target.value)}
            style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
          <select 
            className="form-control" 
            value={filterDateType} 
            onChange={(e) => {
              onFilterDateTypeChange(e.target.value as 'all' | 'day' | 'month');
              onFilterDateValueChange(''); 
            }}
            style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
          >
            <option value="all">All Time</option>
            <option value="day">Specific Day</option>
            <option value="month">Specific Month</option>
          </select>

          {filterDateType === 'day' && (
            <input 
              type="date" 
              className="form-control" 
              value={filterDateValue}
              onChange={(e) => onFilterDateValueChange(e.target.value)}
              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
            />
          )}

          {filterDateType === 'month' && (
            <input 
              type="month" 
              className="form-control" 
              value={filterDateValue}
              onChange={(e) => onFilterDateValueChange(e.target.value)}
              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
            />
          )}

          <select 
            className="form-control" 
            value={sortOrder} 
            onChange={(e) => onSortChange(e.target.value as 'date_desc' | 'date_asc')}
            style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span className="loader"></span>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          No expenses found. Add one above!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const isEditing = editingId === expense.id;
                
                if (isEditing) {
                  return (
                    <tr key={expense.id} style={{ backgroundColor: 'var(--bg-color)' }}>
                      <td>
                        <input 
                          type="date" 
                          className="form-control" 
                          style={{ padding: '0.25rem' }}
                          value={editData.date || ''} 
                          onChange={(e) => setEditData({...editData, date: e.target.value})} 
                        />
                      </td>
                      <td>
                        <select 
                          className="form-control" 
                          style={{ padding: '0.25rem' }}
                          value={editData.category || ''} 
                          onChange={(e) => setEditData({...editData, category: e.target.value})}
                        >
                          <option value="Food">Food</option>
                          <option value="Transport">Transport</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ padding: '0.25rem' }}
                          value={editData.description || ''} 
                          onChange={(e) => setEditData({...editData, description: e.target.value})} 
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          className="form-control" 
                          style={{ padding: '0.25rem', textAlign: 'right', width: '100px', marginLeft: 'auto' }}
                          value={editData.amount ? (editData.amount / 100).toString() : ''} 
                          onChange={(e) => setEditData({...editData, amount: Math.round(parseFloat(e.target.value) * 100)})} 
                        />
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button 
                          disabled={isSaving}
                          onClick={() => handleSave(expense.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success-color)', marginRight: '0.5rem' }}
                          title="Save"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          disabled={isSaving}
                          onClick={cancelEditing}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge">{expense.category}</span>
                    </td>
                    <td>{expense.description || '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                      ₹{(expense.amount / 100).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button 
                        onClick={() => startEditing(expense)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', marginRight: '0.5rem' }}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td colSpan={3} style={{ textAlign: 'right', color: 'var(--text-muted)' }}>Total:</td>
                <td style={{ textAlign: 'right', color: 'var(--success-color)' }}>
                  ₹{(totalAmount / 100).toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
