export const commify = (value: number | bigint | string): string => {
  const [integerPart, decimalPart] = value.toString().split(".");

  let formattedIntegerPart = "";
  let counter = 0;

  for (let i = integerPart.length - 1; i >= 0; i--) {
    counter++;
    formattedIntegerPart = integerPart[i] + formattedIntegerPart;
    if (counter % 3 === 0 && i !== 0) {
      formattedIntegerPart = "," + formattedIntegerPart;
    }
  }

  return decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;
};
