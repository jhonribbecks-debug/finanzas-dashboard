import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import categoryController from '../controllers/category.controller.js';

const router = Router();

const categorySchema = {
  name: { required: true, validators: [{ fn: (v) => typeof v === 'string' && v.trim().length > 0, message: 'El nombre es obligatorio' }] },
  kind: { required: true, validators: [{ fn: (v) => ['ingreso', 'gasto'].includes(v), message: 'El tipo debe ser ingreso o gasto' }] },
  color: { required: false, validators: [] },
  icon: { required: false, validators: [] },
};

const updateCategorySchema = {
  name: { required: false, validators: [{ fn: (v) => typeof v === 'string' && v.trim().length > 0, message: 'El nombre no puede estar vacío' }] },
  kind: { required: false, validators: [{ fn: (v) => ['ingreso', 'gasto'].includes(v), message: 'El tipo debe ser ingreso o gasto' }] },
  color: { required: false, validators: [] },
  icon: { required: false, validators: [] },
};

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', validate(categorySchema), categoryController.create);
router.put('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;