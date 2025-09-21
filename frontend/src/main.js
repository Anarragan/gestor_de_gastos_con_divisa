import { getExpenses, addExpense, deleteExpense } from "./api.js";

const API_URL = import.meta.env.VITE_API_URL;

const expensesList = document.getElementById("expenses-list");
const form = document.getElementById("expense-form");

async function loadExpenses() {
  expensesList.innerHTML = "";
  const expenses = await getExpenses();

  expenses.forEach(exp => {
    const li = document.createElement("li");
    li.className = "expense-card";

    li.innerHTML = `
      <div class="expense-attribute"><strong>Descripción:</strong> ${exp.description}</div>
      <div class="expense-attribute"><strong>Monto:</strong> ${exp.amount} ${exp.currency}</div>
      <div class="expense-attribute"><strong>Categoría:</strong> ${exp.category}</div>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.onclick = async () => {
      await deleteExpense(exp.id);
      loadExpenses();
    };

    li.appendChild(btn);
    expensesList.appendChild(li);
  });
}

async function loadRates() {
  try {
    const res = await fetch(
      `${API_URL}/currency/rates?base=USD&symbols=COP,MXN,EUR,JPY,BRL`
    );
    const data = await res.json();

    const ratesList = document.getElementById("rates-list");
    ratesList.innerHTML = "";

    Object.entries(data.rates).forEach(([currency, value]) => {
      const li = document.createElement("li");
      li.textContent = `1 ${data.base} = ${value.toFixed(2)} ${currency}`;
      ratesList.appendChild(li);
    });
  } catch (err) {
    console.error("Error cargando tasas:", err);
  }
}

document
  .getElementById("convert-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = Number(document.getElementById("convert-amount").value);
    const fromCurrency = document.getElementById("from-currency").value.trim();
    const toCurrency = document.getElementById("to-currency").value.trim();

    try {
      const res = await fetch(`${API_URL}/currency/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, fromCurrency, toCurrency }),
      });

      const data = await res.json();
      document.getElementById(
        "convert-result"
      ).textContent = `${data.originalAmount} ${data.fromCurrency} = ${data.convertedAmount} ${data.toCurrency}`;
    } catch (err) {
      console.error("Error en conversión:", err);
      document.getElementById("convert-result").textContent =
        "Error en conversión";
    }
  });

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const currency = document.getElementById("currency").value.trim();
  const category = document.getElementById("category").value.trim();

  if (!description || !amount || !currency || !category) {
    alert("Todos los campos son obligatorios");
    return;
  }

  await addExpense({ description, amount, currency, category });
  form.reset();
  loadExpenses();
});

loadExpenses();
loadRates();
