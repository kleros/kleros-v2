import { lightTheme as componentsLightTheme, darkTheme as componentsDarkTheme } from "@kleros/ui-components-library";

export const lightTheme = {
  ...componentsLightTheme,
  name: "light",
  white: "#FFFFFF",
  primaryPurple: "#4D00B4",
  secondaryPurple: "#9013FE",
  mediumPurple: "#F8F1FF",
  lightPurple: "#FBF9FE",
  violetPurple: "#6A1DCD",
  lavenderPurple: "#BB72FF",
  primaryBlue: "#009AFF",
  secondaryBlue: "#7BCBFF",
  mediumBlue: "#F0F9FF",
  lightBlue: "#FCFEFF",
  primaryText: "#333333",
  secondaryText: "#999999",
  stroke: "#e5e5e5",
  lightGrey: "#F0F0F0",

  whiteBackground: "#FFFFFF",
  lightBackground: "#FAFBFC",

  defaultShadow: "#00000002",
  hoveredShadow: "#00000002",
  whiteLowOpacity: "#0000000d",
  blackLowOpacity: "#00000080",

  success: "#00C42B",
  successLight: "#F0FBF2",
  warning: "#FF9900",
  warningLight: "#FFF9F0",
  error: "#F60C36",
  errorLight: "#FEF0F3",
  tint: "#D14EFF",
  tintMedium: "#FCF4FF",
  tintPurple: "#F4F0FA",

  transitionSpeed: "0.25s",

  skeletonBackground: "#EBEBEB",
  skeletonHighlight: "#F5F5F5",
};

export const darkTheme = {
  ...componentsDarkTheme,
  name: "dark",
  white: "#FFFFFF",
  primaryPurple: "#7E1BD4",
  secondaryPurple: "#B45FFF",
  mediumPurple: "#390F6C",
  lightPurple: "#FCFBFF",
  violetPurple: "#6A1DCD",
  lavenderPurple: "#BB72FF",
  primaryBlue: "#6CC5FF",
  secondaryBlue: "#A5DBFF",
  mediumBlue: "#2E206C",
  lightBlue: "#2A1260",
  primaryText: "#DAF0FF",
  secondaryText: "#BECCE5",
  stroke: "#42498F",
  lightGrey: "#2D1865",

  whiteBackground: "#220050",
  lightBackground: "#1B003F",

  defaultShadow: "#00000000",
  hoveredShadow: "#42498f80",
  whiteLowOpacity: "#FFFFFF0F",
  blackLowOpacity: "#00000080",

  success: "#65DC7F",
  successLight: "#32355B",
  warning: "#FFC46B",
  warningLight: "#451F54",
  error: "#FF5A78",
  errorLight: "#360652",
  tint: "#DDB6FF",
  tintMedium: "#401D6C",
  tintPurple: "#2F0960",

  transitionSpeed: "0.25s",

  skeletonBackground: "#3A2270",
  skeletonHighlight: "#3E307C",
};
