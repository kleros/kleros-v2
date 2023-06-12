export const commify = (value: number | bigint | string): string => {
  const [integerPart, decimalPart] = value.toString().split(".");

  const formattedIntegerPart = integerPart.replace(/\d(?=(\d{3})+$)/g, "$&,");

  return decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;
};
