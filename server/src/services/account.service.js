import { v4 as uuidv4 } from 'uuid';
import accountRepository from '../repositories/account.repository.js';

class AccountService {
  getAll() {
    return accountRepository.getAll();
  }

  getById(id) {
    const account = accountRepository.getById(id);
    if (!account) {
      const err = new Error('Cuenta no encontrada');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return account;
  }

  create(data) {
    if (accountRepository.hasName(data.name)) {
      const err = new Error('Ya existe una cuenta con ese nombre');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }
    return accountRepository.create({ id: uuidv4(), ...data });
  }

  update(id, data) {
    this.getById(id);
    if (accountRepository.hasName(data.name, id)) {
      const err = new Error('Ya existe una cuenta con ese nombre');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }
    return accountRepository.update(id, data);
  }

  delete(id) {
    this.getById(id);

    if (accountRepository.hasMovements(id)) {
      const err = new Error('No se puede eliminar la cuenta porque tiene movimientos');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }

    return accountRepository.delete(id);
  }
}

export default new AccountService();
