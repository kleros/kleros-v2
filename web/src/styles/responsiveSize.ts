import { css, CSSProperties } from "styled-components";

//supported font types
type FontType = "px" | "rem" | "em" | "vw" | "vh" | "%" | "pt";

/**
 * @description this func applies repsonsivenexx to a css property, the value will range from minSize to maxSize
 * @param property the css property to apply responsive sizes too
 * @param minSize the minimum value of the property
 * @param maxSize max value of the property
 * @param minScreen the min screen width at which the property will be at minSize
 * @param maxScreen the max screen width at which the property will be at maxSize
 * @param fontType
 * @returns
 *
 */
export const responsiveSize = (
  property: keyof CSSProperties,
  minSize: number,
  maxSize: number,
  minScreen: number = 375,
  maxScreen: number = 1250,
  fontType: FontType = "px"
) =>
  css({
    [property]: `calc(${minSize}${fontType} + (${maxSize} - ${minSize}) * (min(max(100vw, ${minScreen}${fontType}), ${maxScreen}${fontType}) - ${minScreen}${fontType}) / (${
      maxScreen - minScreen
    }))`,
  });
