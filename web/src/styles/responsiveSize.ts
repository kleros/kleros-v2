/**
 * @description this func applies repsonsiveness to a css property, the value will range from minSize to maxSize
 * @param minSize the minimum value of the property
 * @param maxSize max value of the property
 * @param minScreen the min screen width at which the property will be at minSize
 * @param maxScreen the max screen width at which the property will be at maxSize
 *
 */
export const responsiveSize = (minSize: number, maxSize: number, minScreen: number = 375, maxScreen: number = 1250) =>
  `calc(${minSize}px + (${maxSize} - ${minSize}) * (min(max(100vw, ${minScreen}px), ${maxScreen}px) - ${minScreen}px) / (${
    maxScreen - minScreen
  }))`;
