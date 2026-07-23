import { http } from '../api/http.js';
import { store } from '../utils/store.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
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

async function loadMovements() {
  const filters = store.get('filters') || {};
  const pagination = store.get('pagination') || { page: 1, limit: 10 };
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.append(k, v);
  });
  params.append('page', pagination.page);
  params.append('limit', pagination.limit);

  try {
    const data = await http.get(`/movements?${params}`);
    store.set('movements', data);
    renderTable();
    renderPagination();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function loadCategories() {
  try {
    const data = await http.get('/categories');
    store.set('categories', data);
    renderFilters();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function loadAccounts() {
  try {
    const data = await http.get('/accounts');
    store.set('accounts', data);
    renderFilters();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function renderTable() {
  const { items } = store.get('movements');
  const container = document.getElementById('movements-table-body');
  if (!container) return;

  container.innerHTML = items
    .map((m) => {
      const sign = m.kind === 'gasto' ? '-' : '+';
      const cls = m.kind === 'gasto' ? 'text-red' : 'text-green';
      return `
    <tr>
      <td>${formatDate(m.date)}</td>
      <td>${m.category_name || ''}</td>
      <td>${m.account_name || ''}</td>
      <td>${m.description || ''}</td>
      <td><span class="badge badge-${m.kind}">${m.kind}</span></td>
      <td class="${cls}">${sign}${formatCurrency(m.amount)}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-edit" data-id="${m.id}">Editar</button>
        <button class="btn btn-sm btn-delete" data-id="${m.id}">Eliminar</button>
      </td>
    </tr>`;
    })
    .join('');

  container.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => editMovement(btn.dataset.id));
  });
  container.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteMovement(btn.dataset.id));
  });
}

function renderPagination() {
  const { pagination } = store.get('movements');
  const container = document.getElementById('pagination');
  if (!container) return;

  const { page, total, totalPages } = pagination;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      `<button class="btn btn-sm ${i === page ? 'btn-active' : ''}" data-page="${i}">${i}</button>`,
    );
  }

  container.innerHTML = `
    <button class="btn btn-sm ${page === 1 ? 'disabled' : ''}" data-page="${page - 1}">Anterior</button>
    ${pages.join('')}
    <button class="btn btn-sm ${page === totalPages ? 'disabled' : ''}" data-page="${page + 1}">Siguiente</button>
  `;

  container.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const newPage = parseInt(btn.dataset.page);
      if (newPage >= 1 && newPage <= totalPages) {
        store.update('pagination', { page: newPage });
        loadMovements();
      }
    });
  });
}

function buildFormHtml(movement = null) {
  const categories = store.get('categories');
  const accounts = store.get('accounts');
  const isEdit = movement !== null;

  const categoryOptions = categories
    .map(
      (c) =>
        `<option value="${c.id}" ${movement && movement.category_id === c.id ? 'selected' : ''}>${c.name}</option>`,
    )
    .join('');
  const accountOptions = accounts
    .map(
      (a) =>
        `<option value="${a.id}" ${movement && movement.account_id === a.id ? 'selected' : ''}>${a.name}</option>`,
    )
    .join('');

  return `
    <form id="movement-form">
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" name="date" value="${movement ? movement.date : ''}" required>
      </div>
      <div class="form-group">
        <label>Categoría</label>
        <select name="category_id" required>
          <option value="">Seleccionar...</option>
          ${categoryOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Cuenta</label>
        <select name="account_id" required>
          <option value="">Seleccionar...</option>
          ${accountOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <input type="text" name="description" value="${movement ? movement.description || '' : ''}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tipo</label>
          <select name="kind" required>
            <option value="ingreso" ${movement && movement.kind === 'ingreso' ? 'selected' : ''}>Ingreso</option>
            <option value="gasto" ${movement && movement.kind === 'gasto' ? 'selected' : ''}>Gasto</option>
          </select>
        </div>
        <div class="form-group">
          <label>Importe</label>
          <input type="number" name="amount" step="0.01" value="${movement ? movement.amount : ''}" required>
        </div>
      </div>
    </form>
  `;
}

function getFormData() {
  const form = document.getElementById('movement-form');
  return {
    date: form.date.value,
    category_id: form.category_id.value,
    account_id: form.account_id.value,
    description: form.description.value,
    kind: form.kind.value,
    amount: parseFloat(form.amount.value),
  };
}

async function addMovement() {
  const { isConfirmed, value } = await Swal.fire({
    title: 'Nuevo movimiento',
    html: buildFormHtml(),
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal-wide' },
    preConfirm: () => {
      const data = getFormData();
      if (!data.date || !data.category_id || !data.account_id || !data.kind || !data.amount || data.amount <= 0) {
        Swal.showValidationMessage('Completa todos los campos correctamente');
        return null;
      }
      return data;
    },
  });

  if (isConfirmed && value) {
    try {
      await http.post('/movements', value);
      toast('Movimiento creado', 'success');
      loadMovements();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
}

async function editMovement(id) {
  const movement = store.get('movements').items.find((m) => m.id === id);
  if (!movement) return;

  const { isConfirmed, value } = await Swal.fire({
    title: 'Editar movimiento',
    html: buildFormHtml(movement),
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal-wide' },
    preConfirm: () => {
      const data = getFormData();
      if (!data.date || !data.category_id || !data.account_id || !data.kind || !data.amount || data.amount <= 0) {
        Swal.showValidationMessage('Completa todos los campos correctamente');
        return null;
      }
      return data;
    },
  });

  if (isConfirmed && value) {
    try {
      await http.put(`/movements/${id}`, value);
      toast('Movimiento actualizado', 'success');
      loadMovements();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
}

async function deleteMovement(id) {
  const { isConfirmed } = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (isConfirmed) {
    try {
      await http.delete(`/movements/${id}`);
      toast('Movimiento eliminado', 'success');
      loadMovements();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
}

function renderFilters() {
  const categories = store.get('categories');
  const accounts = store.get('accounts');
  const filters = store.get('filters') || {};

  const container = document.getElementById('movements-filters');
  if (!container) return;

  const categoryOptions = categories
    .map(
      (c) =>
        `<option value="${c.id}" ${c.id === filters.categoryId ? 'selected' : ''}>${c.name}</option>`,
    )
    .join('');
  const accountOptions = accounts
    .map(
      (a) =>
        `<option value="${a.id}" ${a.id === filters.accountId ? 'selected' : ''}>${a.name}</option>`,
    )
    .join('');

  container.innerHTML = `
    <div class="filters-row">
      <input type="date" id="filter-from" value="${filters.from || ''}">
      <input type="date" id="filter-to" value="${filters.to || ''}">
      <select id="filter-categoryId">
        <option value="">Todas las categorías</option>
        ${categoryOptions}
      </select>
      <select id="filter-accountId">
        <option value="">Todas las cuentas</option>
        ${accountOptions}
      </select>
      <select id="filter-kind">
        <option value="">Todos los tipos</option>
        <option value="ingreso" ${filters.kind === 'ingreso' ? 'selected' : ''}>Ingreso</option>
        <option value="gasto" ${filters.kind === 'gasto' ? 'selected' : ''}>Gasto</option>
      </select>
      <input type="text" id="filter-q" placeholder="Buscar..." value="${filters.q || ''}">
    </div>
    <div class="filters-actions">
      <button id="apply-filters" class="btn btn-primary">Aplicar</button>
      <button id="clear-filters" class="btn btn-secondary">Limpiar</button>
    </div>
  `;

  document.getElementById('apply-filters').addEventListener('click', () => {
    const newFilters = {
      from: document.getElementById('filter-from').value || undefined,
      to: document.getElementById('filter-to').value || undefined,
      categoryId: document.getElementById('filter-categoryId').value || undefined,
      accountId: document.getElementById('filter-accountId').value || undefined,
      kind: document.getElementById('filter-kind').value || undefined,
      q: document.getElementById('filter-q').value || undefined,
    };
    store.set('filters', newFilters);
    store.update('pagination', { page: 1 });
    loadMovements();
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    store.set('filters', {});
    store.update('pagination', { page: 1 });
    loadMovements();
  });
}

function initMovementsPage() {
  store.set('filters', {});
  store.set('pagination', { page: 1, limit: 10 });

  Promise.all([loadCategories(), loadAccounts()]).then(() => {
    renderFilters();
    loadMovements();
  });

  const addBtn = document.getElementById('btn-add-movement');
  if (addBtn) addBtn.addEventListener('click', addMovement);
}

export function MovementsPage() {
  const html = `
    <section class="movements-page">
      <div class="page-header">
        <h1>Movimientos</h1>
        <button id="btn-add-movement" class="btn btn-primary">Nuevo movimiento</button>
      </div>

      <div id="movements-filters" class="filters-section"></div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Cuenta</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Importe</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="movements-table-body"></tbody>
        </table>
      </div>

      <div id="pagination" class="pagination"></div>
    </section>
  `;

  setTimeout(initMovementsPage, 0);
  return html;
}
