import { useMemo, useState } from 'react';
import type { Expense } from '../api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const [chartFilter, setChartFilter] = useState<'category' | 'month' | 'year'>('category');

  const { total, categoryTotals } = useMemo(() => {
    let total = 0;
    const categoryTotals: Record<string, number> = {};

    expenses.forEach(exp => {
      total += exp.amount;
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    return { total, categoryTotals };
  }, [expenses]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, number> = {};

    expenses.forEach(exp => {
      let key = '';
      if (chartFilter === 'category') {
        key = exp.category;
      } else if (chartFilter === 'month') {
        const d = new Date(exp.date);
        key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else if (chartFilter === 'year') {
        key = new Date(exp.date).getFullYear().toString();
      }
      dataMap[key] = (dataMap[key] || 0) + exp.amount;
    });

    return Object.entries(dataMap)
      .map(([name, value]) => ({ name, value: value / 100 }))
      .sort((a, b) => b.value - a.value); // sort descending for better visual
  }, [expenses, chartFilter]);

  // Custom tooltip to format currency
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: payload[0].payload.fill }}>₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Financial Summary</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        
        {/* Left Section: Totals */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Expenditure</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>
              ₹{(total / 100).toFixed(2)}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>By Category</h3>
            {Object.keys(categoryTotals).length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No expenses yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                {Object.entries(categoryTotals).map(([cat, amount]) => (
                  <div key={cat} style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{cat}</p>
                    <p style={{ fontWeight: 600 }}>₹{(amount / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Pie Chart */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-muted)' }}>Expenditure Chart</h3>
            <select 
              className="form-control" 
              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
              value={chartFilter} 
              onChange={(e) => setChartFilter(e.target.value as any)}
            >
              <option value="category">By Category</option>
              <option value="month">By Month</option>
              <option value="year">By Year</option>
            </select>
          </div>

          <div style={{ flexGrow: 1, minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {chartData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Not enough data for chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
