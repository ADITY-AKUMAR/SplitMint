export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const calculatePercentage = (amount, total) => {
  return total === 0 ? 0 : ((amount / total) * 100).toFixed(2);
};

export const roundAmount = (amount) => {
  return Math.round(amount * 100) / 100;
};
