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

async function loadAccounts() {
  try {
    const data = await http.get('/accounts');
    store.set('accounts', data);
    renderTable();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function renderTable() {
  const accounts = store.get('accounts');
  const container = document.getElementById('accounts-table-body');
  if (!container) return;

  if (!accounts || accounts.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="empty-message">Aun no has creado cuentas</div><button class="btn btn-primary" id="empty-add-btn">Nueva cuenta</button></td></tr>`;
    const addBtn = document.getElementById('empty-add-btn');
    if (addBtn) addBtn.addEventListener('click', addAccount);
    return;
  }

  container.innerHTML = accounts
    .map((a) => {
      return `
    <tr>
      <td>${a.name}</td>
      <td>${a.type}</td>
      <td>${formatCurrency(a.initial_balance)}</td>
      <td>${formatCurrency(a.balance)}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-edit" data-id="${a.id}">Editar</button>
        <button class="btn btn-sm btn-delete" data-id="${a.id}">Eliminar</button>
      </td>
    </tr>`;
    })
    .join('');

  container.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => editAccount(btn.dataset.id));
  });
  container.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteAccount(btn.dataset.id));
  });
}

function buildAccountForm(account = null) {
  const initialBalance = account ? account.initial_balance : 0;
  return `
    <form id="account-form">
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" name="name" value="${account ? account.name : ''}" required>
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select name="type" required>
          <option value="efectivo" ${account && account.type === 'efectivo' ? 'selected' : ''}>Efectivo</option>
          <option value="debito" ${account && account.type === 'debito' ? 'selected' : ''}>Débito</option>
          <option value="credito" ${account && account.type === 'credito' ? 'selected' : ''}>Crédito</option>
          <option value="billetera" ${account && account.type === 'billetera' ? 'selected' : ''}>Billetera</option>
        </select>
      </div>
      <div class="form-group">
        <label>Saldo inicial</label>
        <input type="number" name="initial_balance" step="0.01" value="${initialBalance}" required>
      </div>
    </form>
  `;
}

function getAccountFormData() {
  const form = document.getElementById('account-form');
  return {
    name: form.name.value.trim(),
    type: form.type.value,
    initial_balance: parseFloat(form.initial_balance.value),
  };
}

async function addAccount() {
  const { isConfirmed, value } = await Swal.fire({
    title: 'Nueva cuenta',
    html: buildAccountForm(),
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal-wide' },
    preConfirm: () => {
      const data = getAccountFormData();
      if (!data.name || !data.type) {
        Swal.showValidationMessage('Completa nombre y tipo');
        return null;
      }
      return data;
    },
  });

  if (isConfirmed && value) {
    try {
      await http.post('/accounts', value);
      toast('Cuenta creada', 'success');
      loadAccounts();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
}

async function editAccount(id) {
  const account = store.get('accounts').find((a) => a.id === id);
  if (!account) return;

  const { isConfirmed, value } = await Swal.fire({
    title: 'Editar cuenta',
    html: buildAccountForm(account),
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal-wide' },
    preConfirm: () => {
      const data = getAccountFormData();
      if (!data.name || !data.type) {
        Swal.showValidationMessage('Completa nombre y tipo');
        return null;
      }
      return data;
    },
  });

  if (isConfirmed && value) {
    try {
      await http.put(`/accounts/${id}`, value);
      toast('Cuenta actualizada', 'success');
      loadAccounts();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
}

async function deleteAccount(id) {
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
    await http.delete(`/accounts/${id}`);
    toast('Cuenta eliminada', 'success');
    loadAccounts();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function initAccountsPage() {
  loadAccounts();
  const addBtn = document.getElementById('btn-add-account');
  if (addBtn) addBtn.addEventListener('click', addAccount);
}

export function AccountsPage() {
  const html = `
    <section class="accounts-page">
      <div class="page-header">
        <h1>Cuentas</h1>
        <button id="btn-add-account" class="btn btn-primary">Nueva cuenta</button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Saldo inicial</th>
              <th>Saldo actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="accounts-table-body"></tbody>
        </table>
      </div>
    </section>
  `;

  setTimeout(initAccountsPage, 0);
  return html;
}
