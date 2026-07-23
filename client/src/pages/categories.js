import { http } from '../api/http.js';
import { store } from '../utils/store.js';
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

async function loadCategories() {
  try {
    const data = await http.get('/categories');
    store.set('categories', data);
    renderTable();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function renderTable() {
  const categories = store.get('categories');
  const container = document.getElementById('categories-table-body');
  if (!container) return;

  container.innerHTML = categories
    .map((c) => {
      const color = c.color || '#ccc';
      return `
    <tr>
      <td>${c.name}</td>
      <td><span class="badge badge-${c.kind}">${c.kind}</span></td>
      <td><span class="color-swatch" style="background:${color}"></span>${color}</td>
      <td>${c.icon || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-edit" data-id="${c.id}">Editar</button>
        <button class="btn btn-sm btn-delete" data-id="${c.id}">Eliminar</button>
      </td>
    </tr>`;
    })
    .join('');

  container.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => editCategory(btn.dataset.id));
  });
  container.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteCategory(btn.dataset.id));
  });
}

function buildCategoryForm(category = null) {
  const color = category ? category.color || '#ff0000' : '#ff0000';
  return `
    <form id="category-form">
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" name="name" value="${category ? category.name : ''}" required>
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select name="kind" required>
          <option value="ingreso" ${category && category.kind === 'ingreso' ? 'selected' : ''}>Ingreso</option>
          <option value="gasto" ${category && category.kind === 'gasto' ? 'selected' : ''}>Gasto</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Color</label>
          <input type="color" name="color" value="${color}">
        </div>
        <div class="form-group">
          <label>Icono</label>
          <input type="text" name="icon" value="${category ? category.icon || '' : ''}" placeholder="🍔">
        </div>
      </div>
    </form>
  `;
}

function getCategoryFormData() {
  const form = document.getElementById('category-form');
  return {
    name: form.name.value.trim(),
    kind: form.kind.value,
    color: form.color.value,
    icon: form.icon.value.trim(),
  };
}

async function addCategory() {
  const { isConfirmed, value } = await Swal.fire({
    title: 'Nueva categoría',
    html: buildCategoryForm(),
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal-wide' },
    preConfirm: () => {
      const data = getCategoryFormData();
      if (!data.name || !data.kind) {
        Swal.showValidationMessage('Completa nombre y tipo');
        return null;
      }
      return data;
    },
  });

  if (isConfirmed && value) {
    try {
      await http.post('/categories', value);
      toast('Categoría creada', 'success');
      loadCategories();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
}

async function editCategory(id) {
  const category = store.get('categories').find((c) => c.id === id);
  if (!category) return;

  const { isConfirmed, value } = await Swal.fire({
    title: 'Editar categoría',
    html: buildCategoryForm(category),
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal-wide' },
    preConfirm: () => {
      const data = getCategoryFormData();
      if (!data.name || !data.kind) {
        Swal.showValidationMessage('Completa nombre y tipo');
        return null;
      }
      return data;
    },
  });

  if (isConfirmed && value) {
    try {
      await http.put(`/categories/${id}`, value);
      toast('Categoría actualizada', 'success');
      loadCategories();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
}

async function deleteCategory(id) {
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
    await http.delete(`/categories/${id}`);
    toast('Categoría eliminada', 'success');
    loadCategories();
  } catch (err) {
    if (err.status === 409) {
      const category = store.get('categories').find((c) => c.id === id);
      const sameKind = store
        .get('categories')
        .filter((c) => c.id !== id && c.kind === category.kind);

      if (sameKind.length === 0) {
        toast('No hay categorías del mismo tipo para reasignar', 'error');
        return;
      }

      const options = sameKind
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join('');

      const { isConfirmed: reassignConfirmed, value: reassignId } =
        await Swal.fire({
          title: 'Reasignar movimientos',
          html: `
            <p>La categoría tiene movimientos asociados. Selecciona una categoría destino:</p>
            <select id="reassign-select" style="width:100%;padding:0.5rem;border:1px solid #d1d5db;border-radius:4px;">
              ${options}
            </select>
          `,
          showCancelButton: true,
          confirmButtonText: 'Reasignar y eliminar',
          cancelButtonText: 'Cancelar',
          preConfirm: () => document.getElementById('reassign-select').value,
        });

      if (reassignConfirmed && reassignId) {
        try {
          await http.delete(`/categories/${id}?reassignTo=${reassignId}`);
          toast('Categoría eliminada y movimientos reasignados', 'success');
          loadCategories();
        } catch (err) {
          toast(err.message, 'error');
        }
      }
    } else {
      toast(err.message, 'error');
    }
  }
}

function initCategoriesPage() {
  loadCategories();
  const addBtn = document.getElementById('btn-add-category');
  if (addBtn) addBtn.addEventListener('click', addCategory);
}

export function CategoriesPage() {
  const html = `
    <section class="categories-page">
      <div class="page-header">
        <h1>Categorías</h1>
        <button id="btn-add-category" class="btn btn-primary">Nueva categoría</button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Color</th>
              <th>Icono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="categories-table-body"></tbody>
        </table>
      </div>
    </section>
  `;

  setTimeout(initCategoriesPage, 0);
  return html;
}
