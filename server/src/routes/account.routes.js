import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import accountController from '../controllers/account.controller.js';

const router = Router();

const accountSchema = {
  name: { required: true, validators: [{ fn: (v) => typeof v === 'string' && v.trim().length > 0, message: 'El nombre es obligatorio' }] },
  type: { required: true, validators: [{ fn: (v) => ['efectivo', 'debito', 'credito', 'billetera'].includes(v), message: 'El tipo debe ser efectivo, debito, credito o billetera' }] },
  initial_balance: { required: false, validators: [{ fn: (v) => v === undefined || v === null || typeof v === 'number', message: 'El saldo inicial debe ser un número' }] },
};

const updateAccountSchema = {
  name: { required: false, validators: [{ fn: (v) => typeof v === 'string' && v.trim().length > 0, message: 'El nombre no puede estar vacío' }] },
  type: { required: false, validators: [{ fn: (v) => ['efectivo', 'debito', 'credito', 'billetera'].includes(v), message: 'El tipo debe ser efectivo, debito, credito o billetera' }] },
  initial_balance: { required: false, validators: [{ fn: (v) => v === undefined || v === null || typeof v === 'number', message: 'El saldo inicial debe ser un número' }] },
};

router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.post('/', validate(accountSchema), accountController.create);
router.put('/:id', validate(updateAccountSchema), accountController.update);
router.delete('/:id', accountController.delete);

export default router;