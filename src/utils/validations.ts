export const validateEmailInput = (value: string) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  return true; // No need to transform, just validate
};
