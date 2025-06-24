export const lambdas = {
  // Converts a value to hex representation
  hex: function () {
    return function (text: string, render: (value: string) => string) {
      const originalValueStr = render(text);
      const num = parseInt(originalValueStr, 10);
      if (!isNaN(num)) {
        return "0x" + num.toString(16).toLowerCase();
      }
      return originalValueStr;
    };
  },
};
