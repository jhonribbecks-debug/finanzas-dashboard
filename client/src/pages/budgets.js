import { http } from '../api/http.js';
import { store } from '../utils/store.js';
import { formatCurrency } from '../utils/formatters.js';
import Swal from 'sweetalert2';
import Toastify from 'toastify-js';

function toast(message, type = 'info') {
  Toastify({
    text: message,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    backgroundColor:
      type === 'error'
        ? '#ef4444'
        : type === 'success'
        ? '#10b981'
        : '#3b82f6',
  }).showToast();
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getProgressColor(percentage) {
  if (percentage < 80) return '#16a34a';
  if (percentage <= 100) return '#f59e0b';
  return '#dc2626';
}

async function loadCategories() {
  try {
    const data = await http.get('/categories');
    store.set('categories', data);
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function loadBudgets() {
  try {
    const month = store.get('budgetMonth') || getCurrentMonth();
    const data = await http.get(`/budgets?month=${month}`);
    store.set('budgets', data);
    renderTable();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function renderTable() {
  const budgets = store.get('budgets');
  const container = document.getElementById('budgets-table-body');
  if (!container) return;

  if (!budgets || budgets.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay presupuestos para este mes</td></tr>';
    return;
  }

  container.innerHTML = budgets
    .map((b) => {
      const budgeted = b.amount;
      const spent = b.spent || 0;
      const difference = budgeted - spent;
      const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
      const progressWidth = Math.min(percentage, 100);
      const progressColor = getProgressColor(percentage);
      const diffClass = difference >= 0 ? 'text-green' : 'text-red';
      const diffSign = difference >= 0 ? '' : '-';

      return `
    <tr>
      <td>${b.category_name || ''}</td>
      <td>${formatCurrency(budgeted)}</td>
      <td>${formatCurrency(spent)}</td>
      <td class="${diffClass}">${diffSign}${formatCurrency(Math.abs(difference))}</td>
      <td>
        <div class="progress-container">
          <div class="progress-bar" style="width:${progressWidth}%;background-color:${progressColor}"></div>
        </div>
        <small>${Math.round(percentage)}%</small>
      </td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-edit" data-id="${b.id}">Editar</button>
        <button class="btn btn-sm btn-delete" data-id="${b.id}">Eliminar</button>
      </td>
    </tr>`;
    })
    .join('');

  container.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => editBudget(btn.dataset.id));
  });
  container.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteBudget(btn.dataset.id));
  });
}

function buildBudgetForm(budget = null) {
  const categories = store.get('categories') || [];
  const gastoCats = categories.filter((c) => c.kind === 'gasto');
  const categoryOptions = gastoCats
    .map(
      (c) =>
        `<option value="${c.id}" ${budget && budget.category_id === c.id ? 'selected' : ''}>${c.name}</option>`,
    )
    .join('');

  const defaultMonth = getCurrentMonth();

  return `
    <form id="budget-form">
      <div class="form-group">
        <label>Mes</label>
        <input type="month" name="month" value="${budget ? budget.month : defaultMonth}" required>
      </div>
      <div class="form-group">
        <label>Categoría</label>
        <select name="category_id" required>
          <option value="">Seleccionar...</option>
          ${categoryOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Monto presupuestado</label>
        <input type="number" name="amount" step="0.01" value="${budget ? budget.amount : ''}" required>
      </div>
    </form>
  `;
}

function getBudgetFormData() {
  const form = document.getElementById('budget-form');
  return {
    month: form.month.value,
    category_id: form.category_id.value,
    amount: parseFloat(form.amount.value),
  };
}

async function addBudget() {
  const { isConfirmed, value } = await Swal.fire({
    title: 'Nuevo presupuesto',
    html: buildBudgetForm(),
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal-wide' },
    preConfirm: () => {
      const data = getBudgetFormData();
      if (!data.month || !data.category_id || !data.amount || data.amount <= 0) {
        Swal.showValidationMessage('Completa todos los campos correctamente');
        return null;
      }
      return data;
    },
  });

  if (isConfirmed && value) {
    try {
      await http.post('/budgets', value);
      toast('Presupuesto creado', 'success');
      loadBudgets();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
}

async function editBudget(id) {
  const budgets = store.get('budgets');
  const budget = budgets.find((b) => b.id === id);
  if (!budget) return;

  const { isConfirmed, value } = await Swal.fire({
    title: 'Editar presupuesto',
    html: buildBudgetForm(budget),
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal-wide' },
    preConfirm: () => {
      const data = getBudgetFormData();
      if (!data.month || !data.category_id || !data.amount || data.amount <= 0) {
        Swal.showValidationMessage('Completa todos los campos correctamente');
        return null;
      }
      return data;
    },
  });

  if (isConfirmed && value) {
    try {
      await http.put(`/budgets/${id}`, value);
      toast('Presupuesto actualizado', 'success');
      loadBudgets();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
}

async function deleteBudget(id) {
  const { isConfirmed } = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (!isConfirmed) return;

  try {
    await http.delete(`/budgets/${id}`);
    toast('Presupuesto eliminado', 'success');
    loadBudgets();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function initBudgetsPage() {
  store.set('budgetMonth', getCurrentMonth());

  loadCategories();
  loadBudgets();

  const monthSelector = document.getElementById('budget-month-selector');
  if (monthSelector) {
    monthSelector.addEventListener('change', (e) => {
      store.set('budgetMonth', e.target.value);
      loadBudgets();
    });
  }

  const addBtn = document.getElementById('btn-add-budget');
  if (addBtn) addBtn.addEventListener('click', addBudget);
}

export function BudgetsPage() {
  const defaultMonth = getCurrentMonth();
  const html = `
    <section class="budgets-page">
      <div class="page-header">
        <h1>Presupuestos</h1>
        <button id="btn-add-budget" class="btn btn-primary">Nuevo presupuesto</button>
      </div>

      <div class="month-selector">
        <label for="budget-month-selector">Mes:</label>
        <input type="month" id="budget-month-selector" value="${defaultMonth}">
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Presupuestado</th>
              <th>Gastado</th>
              <th>Diferencia</th>
              <th>Progreso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="budgets-table-body"></tbody>
        </table>
      </div>
    </section>
  `;

  setTimeout(initBudgetsPage, 0);
  return html;
}
