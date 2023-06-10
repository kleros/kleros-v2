export const commify = (value: number | bigint | string): string => {
  const [integerPart, decimalPart] = value.toString().split(".");

  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;
};
