import dayjs from 'dayjs';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
};

export const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateISO = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const formatMonth = (month) => {
  return dayjs(`${month}-01`).format('MMM YYYY');
};
