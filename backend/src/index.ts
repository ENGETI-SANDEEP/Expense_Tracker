import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Validation schema for creating an expense
const expenseSchema = z.object({
  amount: z.number().int().min(0, "Amount cannot be negative"), // Using cents
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

app.post('/expenses', (req: Request, res: Response): any => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    
    if (idempotencyKey) {
      // Check if we already processed this request
      const existing = db.prepare('SELECT * FROM expenses WHERE idempotency_key = ?').get(idempotencyKey);
      if (existing) {
        return res.status(200).json({ message: 'Expense already created', data: existing });
      }
    }

    const validatedData = expenseSchema.parse(req.body);
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO expenses (id, amount, category, description, date, created_at, idempotency_key)
      VALUES (@id, @amount, @category, @description, @date, @created_at, @idempotency_key)
    `);

    insertStmt.run({
      id,
      amount: validatedData.amount,
      category: validatedData.category,
      description: validatedData.description || null,
      date: validatedData.date,
      created_at: createdAt,
      idempotency_key: idempotencyKey || null
    });

    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    return res.status(201).json({ message: 'Expense created successfully', data: newExpense });

  } catch (error) {
    // If it's a validation error
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.issues });
    }
    // Handle uniqueness constraint failure just in case of race condition
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Conflict: idempotency key already used' });
    }
    console.error('Error creating expense:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/expenses', (req: Request, res: Response): any => {
  try {
    const { category, sort } = req.query;
    
    let query = 'SELECT * FROM expenses';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    if (sort === 'date_desc') {
      query += ' ORDER BY date DESC, created_at DESC';
    } else {
      query += ' ORDER BY date ASC, created_at ASC';
    }

    const expenses = db.prepare(query).all(...params);
    return res.status(200).json({ data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/expenses/:id', (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    const validatedData = expenseSchema.parse(req.body);

    const updateStmt = db.prepare(`
      UPDATE expenses 
      SET amount = @amount, category = @category, description = @description, date = @date
      WHERE id = @id
    `);

    const result = updateStmt.run({
      id,
      amount: validatedData.amount,
      category: validatedData.category,
      description: validatedData.description || null,
      date: validatedData.date,
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updatedExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    return res.status(200).json({ message: 'Expense updated successfully', data: updatedExpense });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.issues });
    }
    console.error('Error updating expense:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/expenses/:id', (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
