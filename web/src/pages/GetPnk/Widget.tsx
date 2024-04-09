import React, { useMemo } from "react";
import { LiFiWidget, WidgetConfig } from "@lifi/widget";
import { Theme, useTheme } from "styled-components";

const getWidgetConfig = (theme: Theme): WidgetConfig => ({
  fromChain: 1,
  toChain: 42161,
  fromToken: "0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d",
  toToken: "0x330bD769382cFc6d50175903434CCC8D206DCAE5",
  containerStyle: {
    border: `1px solid ${theme.stroke}`,
    borderRadius: "3px",
    background: theme.whiteBackground,
  },
  hiddenUI: ["appearance", "language"],
  theme: {
    palette: {
      primary: {
        main: theme.primaryBlue,
      },
      secondary: {
        main: theme.primaryBlue,
      },
      background: {
        paper: theme.whiteBackground, // bg color for cards
        default: theme.whiteBackground, // bg color container
      },
      grey: {
        300: theme.stroke, // border light theme
        800: theme.stroke, // border dark theme
      },
      text: {
        primary: theme.primaryText,
        secondary: theme.secondaryText,
      },
    },
    shape: {
      borderRadius: 3,
      borderRadiusSecondary: 3,
    },
    typography: {
      // fontFamily: "Comic Sans MS",
    },
  },
  integrator: "Kleros",
});

export const Widget = () => {
  const theme = useTheme();

  const widgetConfig = useMemo(() => getWidgetConfig(theme), [theme]);

  return <LiFiWidget config={widgetConfig} integrator="Kleros" />;
};
