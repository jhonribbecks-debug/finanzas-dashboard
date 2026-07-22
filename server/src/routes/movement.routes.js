import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import movementController from '../controllers/movement.controller.js';

const router = Router();

const movementSchema = {
  kind: { required: true, validators: [{ fn: (v) => ['ingreso', 'gasto'].includes(v), message: 'El tipo debe ser ingreso o gasto' }] },
  amount: { required: true, validators: [{ fn: (v) => typeof v === 'number' && v > 0, message: 'El monto debe ser un número mayor a 0' }] },
  date: { required: true, validators: [{ fn: (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v), message: 'La fecha debe tener formato YYYY-MM-DD' }] },
  description: { required: false, validators: [] },
  category_id: { required: true, validators: [{ fn: (v) => typeof v === 'string' && v.trim().length > 0, message: 'La categoría es obligatoria' }] },
  account_id: { required: true, validators: [{ fn: (v) => typeof v === 'string' && v.trim().length > 0, message: 'La cuenta es obligatoria' }] },
};

const updateMovementSchema = {
  kind: { required: false, validators: [{ fn: (v) => ['ingreso', 'gasto'].includes(v), message: 'El tipo debe ser ingreso o gasto' }] },
  amount: { required: false, validators: [{ fn: (v) => typeof v === 'number' && v > 0, message: 'El monto debe ser un número mayor a 0' }] },
  date: { required: false, validators: [{ fn: (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v), message: 'La fecha debe tener formato YYYY-MM-DD' }] },
  description: { required: false, validators: [] },
  category_id: { required: false, validators: [{ fn: (v) => v === undefined || (typeof v === 'string' && v.trim().length > 0), message: 'La categoría no puede estar vacía' }] },
  account_id: { required: false, validators: [{ fn: (v) => v === undefined || (typeof v === 'string' && v.trim().length > 0), message: 'La cuenta no puede estar vacía' }] },
};

router.get('/', movementController.getAll);
router.get('/:id', movementController.getById);
router.post('/', validate(movementSchema), movementController.create);
router.put('/:id', validate(updateMovementSchema), movementController.update);
router.delete('/:id', movementController.delete);

export default router;