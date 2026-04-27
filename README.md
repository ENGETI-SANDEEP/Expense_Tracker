# 💸 Personal Expense Tracker

A minimal, robust full-stack personal finance tool that allows users to seamlessly record, review, and analyze their personal expenses. Designed with real-world conditions in mind, featuring network resilience, data idempotency, and responsive design.

---

## ✨ Features

- **Core CRUD**: Create, read, update, and delete expenses effortlessly using inline-table editing.
- **Dynamic Summaries**: Real-time total expenditure and category-wise breakdowns.
- **Interactive Visualizations**: View your expenditure through dynamic pie charts (by category, month, or year).
- **Advanced Filtering**: Drill down into your data by category, specific day, or specific month.
- **Idempotent API**: Built to handle network retries gracefully. If you submit the same form twice due to a laggy connection, the backend guarantees no duplicate charges.
- **Data Integrity**: Money is handled correctly using integer arithmetic (cents) across the stack to avoid Javascript floating-point anomalies.
- **Dark Mode**: Fully supports an elegant dark mode toggled directly from the UI.

---

## 🛠️ Technology Stack

**Frontend:**
- React (bootstrapped with Vite)
- TypeScript
- Vanilla CSS (with CSS variables for theming)
- Recharts (for data visualization)
- Lucide React (for iconography)

**Backend:**
- Node.js & Express
- TypeScript
- SQLite (via `better-sqlite3` for zero-configuration, robust local storage)
- Zod (for strict runtime validation)

---

## 🚀 Running the Application

To get this project running on your local machine, you will need to start both the backend server and the frontend client.

### 1. Start the Backend API

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
npm run dev
```

> **Note:** The backend API will be running on `http://localhost:3001`. The SQLite database file (`data.db`) will automatically be generated in the root of the project upon first start.

### 2. Start the Frontend Client

Open a **new** terminal window and navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

> **Note:** The frontend application will be accessible at the address printed in your console (usually `http://localhost:5173`).

---

## 🏗️ Key Design Decisions & Architecture

1. **Decoupled Architecture**: 
   The project is strictly split into a Node.js/Express backend and a React frontend. This enforces a clean separation of concerns and mimics real-world production setups.
   
2. **Database Choice (SQLite)**: 
   SQLite was chosen via `better-sqlite3` as it provides the transactional guarantees and query capabilities of a relational DB without requiring complex Docker setups or external servers. `WAL` mode is enabled for high concurrency.

3. **Money Handling**: 
   Storing currency as floating-point numbers can lead to dangerous precision errors (e.g., `0.1 + 0.2 = 0.30000000000000004`). To prevent this, **amounts are stored exclusively in cents as integers** in the backend and database. The frontend handles the math to convert this to standard currency formats for input and display.

4. **Resilience & Idempotency**: 
   - Poor network conditions can cause requests to fail after reaching the server, leading to users retrying submissions.
   - To safely handle multiple clicks or network retries, the system implements an **Idempotency-Key**.
   - The React client generates a unique UUID (`Idempotency-Key`) for each submission intent.
   - The backend checks this key. If a retry occurs with the same key, it returns the previously created record rather than duplicating the expense in the database.

5. **Styling & UI UX**: 
   Vanilla CSS was used over Tailwind to keep dependencies minimal while still providing a modern, accessible interface. It heavily utilizes CSS Variables, making the integration of the Dark/Light theme toggle seamless.

## ⚖️ Trade-offs Made

1. **Simplified Validation**: Zod is used in the backend for strong payload validation. In a much larger app, custom error formatting or multi-field constraints would be expanded upon.
2. **No Pagination**: The list currently fetches all records and filters them locally to make generating the summary charts easier. A massive production app would implement cursor-based or offset pagination alongside a dedicated `/summary` aggregation endpoint on the backend.
3. **Authentication**: Omitted to keep the feature set focused strictly on the core logic of expense tracking.
