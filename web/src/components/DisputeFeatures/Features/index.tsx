import React from "react";
import styled from "styled-components";

import { Radio } from "@kleros/ui-components-library";

import { Features } from "consts/disputeFeature";

import WithHelpTooltip from "components/WithHelpTooltip";

import ClassicVote from "./ClassicVote";
import GatedErc1155 from "./GatedErc1155";
import GatedErc20 from "./GatedErc20";

export type RadioInput = {
  name: string;
  value: Features;
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
};

export type FeatureUI = React.FC<RadioInput>;

export const StyledRadio = styled(Radio)`
  font-size: 14px;
  color: ${({ theme, disabled }) => (disabled ? theme.secondaryText : theme.primaryText)};
  opacity: ${({ disabled }) => (disabled ? "0.7" : 1)};
`;

export const FeatureUIs: Record<Features, FeatureUI> = {
  [Features.ShieldedVote]: (props: RadioInput) => (
    <WithHelpTooltip
      tooltipMsg={`The jurors votes are hidden. 
        Nobody can see them before the voting period completes. 
        It takes place in a single step via Shutter Network`}
      key={Features.ShieldedVote}
    >
      <StyledRadio label="Single-step via Shutter Network" small {...props} />
    </WithHelpTooltip>
  ),

  [Features.ClassicVote]: (props: RadioInput) => <ClassicVote {...props} />,

  [Features.ClassicEligibility]: (props: RadioInput) => (
    <StyledRadio key={Features.ClassicEligibility} label="All the jurors in this court" small {...props} />
  ),

  [Features.GatedErc20]: (props: RadioInput) => <GatedErc20 {...props} />,

  [Features.GatedErc1155]: (props: RadioInput) => <GatedErc1155 {...props} />,
};
