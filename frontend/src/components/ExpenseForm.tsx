import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../api';
import { Plus } from 'lucide-react';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate an idempotency key when the component mounts or after a successful submission
  const [idempotencyKey, setIdempotencyKey] = useState(() => uuidv4());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const amountFloat = parseFloat(amountStr);
      if (isNaN(amountFloat) || amountFloat < 0) {
        throw new Error('Please enter a valid positive amount.');
      }

      // Convert amount to cents
      const amountInCents = Math.round(amountFloat * 100);

      await api.createExpense({
        amount: amountInCents,
        category,
        description,
        date,
      }, idempotencyKey);

      // Reset form and generate a new key for the next submission
      setAmountStr('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIdempotencyKey(uuidv4());
      
      onExpenseAdded();
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Add New Expense</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0"
              required
              className="form-control"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              disabled={isSubmitting}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              required
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="" disabled>Select a category</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <input
            type="text"
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g., Groceries"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            required
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', marginTop: '0.5rem' }}>
          {isSubmitting ? (
            <span className="loader" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></span>
          ) : (
            <>
              <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Expense
            </>
          )}
        </button>
      </form>
    </div>
  );
}
