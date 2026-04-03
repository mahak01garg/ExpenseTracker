// app.js - Expense Tracker
// Keep transactions in localStorage under key 'transactions_v1'

const balanceEl = document.getElementById('balance');
const moneyPlusEl = document.getElementById('money-plus');
const moneyMinusEl = document.getElementById('money-minus');
const listEl = document.getElementById('list');
const form = document.getElementById('transaction-form');
const textEl = document.getElementById('text');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');

const LOCAL_STORAGE_KEY = 'transactions_v1';

// Load initial transactions from localStorage or sample
let transactions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [
  // Example starter transactions (comment/remove if you want blank start)
  // { id: generateID(), text: 'Pocket money', amount: 500 },
  // { id: generateID(), text: 'Coffee', amount: -60 }
];

// Helper: generate unique ID
function generateID() {
  // Use timestamp + random to reduce collision
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Add transaction to DOM list
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add('transaction');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

  const amountAbs = Math.abs(Number(transaction.amount)).toFixed(2);

  item.innerHTML = `
    <div class="details">
      <div class="desc">${escapeHtml(transaction.text)}</div>
      <div class="time">${new Date(transaction.idTimestamp || parseInt(transaction.id.substr(0,8),36)).toLocaleString()}</div>
    </div>
    <div class="amount">
      <strong>${sign}₹${amountAbs}</strong>
      <button class="delete-btn" title="Delete" data-id="${transaction.id}">✕</button>
    </div>
  `;

  listEl.prepend(item); // newest first

  // attach delete listener
  item.querySelector('.delete-btn').addEventListener('click', e => {
    const id = e.target.getAttribute('data-id');
    removeTransaction(id);
  });
}

// Update balance, income, expenses
function updateValues() {
  const amounts = transactions.map(t => Number(t.amount));
  const total = amounts.reduce((acc, val) => acc + val, 0);
  const income = amounts.filter(a => a > 0).reduce((acc, val) => acc + val, 0);
  const expense = amounts.filter(a => a < 0).reduce((acc, val) => acc + val, 0);

  balanceEl.innerText = `₹${total.toFixed(2)}`;
  moneyPlusEl.innerText = `+₹${income.toFixed(2)}`;
  moneyMinusEl.innerText = `-₹${Math.abs(expense).toFixed(2)}`;
}

// Remove transaction by id
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  refreshUI();
}

// Add new transaction
function addTransaction(e) {
  e.preventDefault();

  const text = textEl.value.trim();
  let amount = Number(amountEl.value);

  if (!text || isNaN(amount) || amount === 0) {
    alert('Enter valid description and non-zero amount.');
    return;
  }

  // Check type select
  const selectedType = typeEl.value; // 'auto', 'income', 'expense'
  if (selectedType === 'income' && amount < 0) amount = Math.abs(amount);
  if (selectedType === 'expense' && amount > 0) amount = -Math.abs(amount);

  // If auto and amount sign provided, keep sign as user entered.
  const transaction = {
    id: generateID(),
    text,
    amount: Number(amount),
    // store timestamp derived from Date.now (for display)
    idTimestamp: Date.now()
  };

  transactions.push(transaction);
  updateLocalStorage();
  refreshUI();

  form.reset();
}

// Save to localStorage
function updateLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
}

// Clear and re-render UI
function refreshUI() {
  // clear list
  listEl.innerHTML = '';
  // render transactions
  transactions.slice().reverse().forEach(addTransactionDOM); // reverse to keep newest first
  updateValues();
}

// Escape HTML to avoid injection
function escapeHtml(unsafe) {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Initialize app
function init() {
  refreshUI();
  form.addEventListener('submit', addTransaction);

  // optional: allow delete with double click on list item
  listEl.addEventListener('dblclick', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (btn) {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this transaction?')) removeTransaction(id);
    }
  });
}

init();
