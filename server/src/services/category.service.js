import { v4 as uuidv4 } from 'uuid';
import categoryRepository from '../repositories/category.repository.js';

class CategoryService {
  getAll() {
    return categoryRepository.getAll();
  }

  getById(id) {
    const category = categoryRepository.getById(id);
    if (!category) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return category;
  }

  create(data) {
    if (categoryRepository.hasName(data.name, data.kind)) {
      const err = new Error('Ya existe una categoría con ese nombre y tipo');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }
    return categoryRepository.create({ id: uuidv4(), ...data });
  }

  update(id, data) {
    this.getById(id);
    if (categoryRepository.hasName(data.name, data.kind, id)) {
      const err = new Error('Ya existe una categoría con ese nombre y tipo');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }
    return categoryRepository.update(id, data);
  }

  delete(id, reassignToId = null) {
    this.getById(id);

    if (reassignToId) {
      this.getById(reassignToId);
      categoryRepository.reassignMovements(id, reassignToId);
    } else if (categoryRepository.hasMovements(id)) {
      const err = new Error('No se puede eliminar la categoría porque tiene movimientos. Use ?reassignTo= para reasignarlos.');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }

    return categoryRepository.delete(id);
  }
}

export default new CategoryService();
