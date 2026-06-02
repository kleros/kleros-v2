/**
 * @description this func applies repsonsiveness to a css property, the value will range from minSize to maxSize
 * @param minSize the minimum value of the property
 * @param maxSize max value of the property
 * @param minScreen the min screen width at which the property will be at minSize
 * @param maxScreen the max screen width at which the property will be at maxSize
 *
 */
export const responsiveSize = (minSize: number, maxSize: number, minScreen = 375, maxScreen = 1250) => {
  const range = maxScreen - minScreen;
  const clamped = `min(max(100vw, ${minScreen}px), ${maxScreen}px)`;
  return `calc(${minSize}px + (${maxSize} - ${minSize}) * (${clamped} - ${minScreen}px) / (${range}))`;
};
