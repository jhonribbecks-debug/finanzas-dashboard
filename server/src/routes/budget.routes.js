import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import budgetController from '../controllers/budget.controller.js';

const router = Router();

const budgetSchema = {
  month: { required: true, validators: [{ fn: (v) => typeof v === 'string' && /^\d{4}-\d{2}$/.test(v), message: 'El mes debe tener formato YYYY-MM' }] },
  category_id: { required: true, validators: [{ fn: (v) => typeof v === 'string' && v.trim().length > 0, message: 'La categoría es obligatoria' }] },
  amount: { required: true, validators: [{ fn: (v) => typeof v === 'number' && v > 0, message: 'El monto debe ser un número mayor a 0' }] },
};

const updateBudgetSchema = {
  month: { required: false, validators: [{ fn: (v) => v === undefined || (typeof v === 'string' && /^\d{4}-\d{2}$/.test(v)), message: 'El mes debe tener formato YYYY-MM' }] },
  category_id: { required: false, validators: [{ fn: (v) => v === undefined || (typeof v === 'string' && v.trim().length > 0), message: 'La categoría no puede estar vacía' }] },
  amount: { required: false, validators: [{ fn: (v) => v === undefined || (typeof v === 'number' && v > 0), message: 'El monto debe ser un número mayor a 0' }] },
};

router.get('/', budgetController.getAll);
router.get('/:id', budgetController.getById);
router.post('/', validate(budgetSchema), budgetController.create);
router.put('/:id', validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;
