// src/routes/+page.server.js
// Server-only code. Connects to Postgres. Never sent to the browser.

import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

const sql = neon(DATABASE_URL);

// SvelteKit calls this function whenever the page is requested.
// Whatever object we return becomes available to +page.svelte as `data`.
export async function load() {
  // SELECT all transactions from the database, oldest first.
  // date::text AS date keeps the date clean for the page.
  const rows = await sql`
    SELECT id, date::text AS date, description, debit, credit, amount
    FROM transactions
    ORDER BY date
  `;

  return { transactions: rows };
}

// SvelteKit actions run when a form is submitted.
export const actions = {
  default: async ({ request }) => {
    // 1. Get the form data the browser sent.
    const formData = await request.formData();

    const date = formData.get('date');
    const description = formData.get('description');
    const debit = formData.get('debit');
    const credit = formData.get('credit');
    const amount = formData.get('amount');

    // 2. Insert one new transaction into the database.
    // The id column auto-fills.
    await sql`
      INSERT INTO transactions (date, description, debit, credit, amount)
      VALUES (${date}, ${description}, ${debit}, ${credit}, ${amount})
    `;

    // 3. Return success. SvelteKit will re-run load() automatically,
    // so the page picks up the new row.
    return { success: true };
  }
};