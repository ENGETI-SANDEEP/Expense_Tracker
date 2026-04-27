import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, type Expense } from './api';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseSummary } from './components/ExpenseSummary';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateType, setFilterDateType] = useState<'all' | 'day' | 'month'>('all');
  const [filterDateValue, setFilterDateValue] = useState('');
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc'>('date_desc');
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all expenses without category filter to compute accurate totals
      const data = await api.getExpenses(undefined, sortOrder);
      setAllExpenses(data);
    } catch (err: any) {
      setError('Failed to load expenses. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = useMemo(() => {
    let result = allExpenses;

    if (filterCategory) {
      result = result.filter(e => e.category === filterCategory);
    }

    if (filterDateType === 'day' && filterDateValue) {
      result = result.filter(e => e.date === filterDateValue);
    } else if (filterDateType === 'month' && filterDateValue) {
      result = result.filter(e => e.date.startsWith(filterDateValue));
    }

    return result;
  }, [allExpenses, filterCategory, filterDateType, filterDateValue]);

  return (
    <div className="container">
      <header className="header" style={{ position: 'relative' }}>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle" 
          style={{ position: 'absolute', right: 0, top: 0 }}
          title="Toggle Dark Mode"
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
        <h1>Expense Tracker</h1>
        <p>Record and review your personal expenses</p>
      </header>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>
          {error}
          <button 
            onClick={fetchExpenses} 
            className="btn btn-primary" 
            style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
          >
            Retry
          </button>
        </div>
      )}

      <ExpenseSummary expenses={allExpenses} />

      <ExpenseForm onExpenseAdded={fetchExpenses} />
      
      <ExpenseList 
        expenses={filteredExpenses}
        isLoading={isLoading}
        filterCategory={filterCategory}
        onFilterChange={setFilterCategory}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        filterDateType={filterDateType}
        onFilterDateTypeChange={setFilterDateType}
        filterDateValue={filterDateValue}
        onFilterDateValueChange={setFilterDateValue}
        onExpensesChanged={fetchExpenses}
      />
    </div>
  );
}

export default App;
