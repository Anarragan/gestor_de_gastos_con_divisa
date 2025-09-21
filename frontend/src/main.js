import { getExpenses, addExpense, deleteExpense } from "./api.js";

const expensesList = document.getElementById("expenses-list");
const form = document.getElementById("expense-form");

async function loadExpenses() {
  expensesList.innerHTML = "";
  const expenses = await getExpenses();

  expenses.forEach(exp => {
    const li = document.createElement("li");
    li.textContent = `${exp.description} - ${exp.amount} ${exp.currency} [${exp.category}]`;

    // botón eliminar
    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.onclick = async () => {
      await deleteExpense(exp.id);
      loadExpenses(); // recargar lista
    };

    li.appendChild(btn);
    expensesList.appendChild(li);
  });
}

// al cargar
loadExpenses();

// al enviar el form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value.trim();
  const amount = Number(document.getElementById("amount").value); // 👈 Conversión
  const currency = document.getElementById("currency").value.trim();
  const category = document.getElementById("category").value.trim();

  if (!description || !amount || !currency || !category) {
    alert("Todos los campos son obligatorios");
    return;
  }

  await addExpense({ description, amount, currency, category });
  form.reset();
  loadExpenses(); // recargar después de agregar
});