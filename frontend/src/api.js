const API_URL = "http://localhost:3000"; 

export async function getExpenses() {
  const res = await fetch(`${API_URL}/expenses`);
  const data = await res.json();
  return data.expenses || data;
}

export async function addExpense(expense) {
  const res = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: "DELETE",
  });
  return res.json();
}