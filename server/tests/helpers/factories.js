import { v4 as uuidv4 } from 'uuid';

export const createCategory = (overrides = {}) => ({
  id: uuidv4(),
  name: 'Test Category',
  kind: 'gasto',
  color: '#ff0000',
  icon: '🏷️',
  ...overrides,
});

export const createAccount = (overrides = {}) => ({
  id: uuidv4(),
  name: 'Test Account',
  type: 'efectivo',
  initial_balance: 1000,
  ...overrides,
});

export const createMovement = (overrides = {}) => ({
  id: uuidv4(),
  kind: 'gasto',
  amount: 100,
  date: '2024-01-15',
  description: 'Test movement',
  category_id: uuidv4(),
  account_id: uuidv4(),
  ...overrides,
});