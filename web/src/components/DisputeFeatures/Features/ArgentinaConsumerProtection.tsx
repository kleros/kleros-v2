import React from "react";

import { Features } from "consts/disputeFeature";

import WithHelpTooltip from "components/WithHelpTooltip";

import { RadioInput, StyledRadio } from ".";

const ArgentinaConsumerProtection: React.FC<RadioInput> = (props) => {
  return (
    <WithHelpTooltip
      tooltipMsg={`Jurors must hold either an accredited professional token or
        an accredited consumer protection lawyer token to participate.
        At least one drawn juror must hold the consumer protection lawyer token.`}
      key={Features.ArgentinaConsumerProtection}
    >
      <StyledRadio label="Argentina Consumer Protection" small {...props} />
    </WithHelpTooltip>
  );
};

export default ArgentinaConsumerProtection;
