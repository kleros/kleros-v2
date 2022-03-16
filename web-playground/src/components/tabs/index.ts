import L1Arbitrable from "./l1-arbitrable";
import L1Gateway from "./l1-gateway";
import SimpleBridge from "./simple-bridge";
import FastBridge from "./fast-bridge";
import L2Gateway from "./l2-gateway";
import KlerosCore from "./kleros-core";
import Juror from "./juror";
import Witness from "./witness";

export const pages = [
  L1Arbitrable,
  L1Gateway,
  SimpleBridge,
  FastBridge,
  L2Gateway,
  KlerosCore,
  Juror,
  Witness,
];

export const tabItems = [
  {
    text: "L1 Arbitrable",
    value: 0,
  },
  {
    text: "L1 Gateway",
    value: 1,
  },
  {
    text: "Simple Bridge",
    value: 2,
  },
  {
    text: "Fast Bridge",
    value: 3,
  },
  {
    text: "L2 Gateway",
    value: 4,
  },
  {
    text: "Kleros Core",
    value: 5,
  },
  {
    text: "Juror",
    value: 6,
  },
  {
    text: "Witness",
    value: 7,
  },
];
