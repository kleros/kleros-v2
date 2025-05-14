import React from "react";
import styled from "styled-components";

import { Card, Radio } from "@kleros/ui-components-library";

import CaseFromScratchIcon from "svgs/icons/caseFromScratch.svg";
import DuplicateCaseIcon from "svgs/icons/duplicateCase.svg";

import { responsiveSize } from "styles/responsiveSize";

import { Divider } from "components/Divider";
import { NumberInputField } from "components/NumberInputField";
import WithHelpTooltip from "components/WithHelpTooltip";

export enum CreationMethod {
  Scratch,
  Duplicate,
}

const StyledCard = styled(Card)<{ selected?: boolean }>`
  height: fit-content;
  width: 100%;
  background: ${({ theme, selected }) => (selected ? theme.whiteBackground : theme.lightBackground)};
`;

const CardTopContent = styled.div`
  width: 100%;
  padding: 8px ${responsiveSize(16, 24)};
  display: flex;
  align-items: center;
  gap: ${responsiveSize(8, 16)};
`;

const CardBottomContent = styled.div`
  width: 100%;
  padding: 16px ${responsiveSize(16, 24)};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${responsiveSize(8, 16)};
`;

const Icon = styled.svg`
  width: 48px;
  height: 48px;
  circle {
    fill: ${({ theme }) => theme.lightBlue};
    stroke: ${({ theme }) => theme.primaryBlue};
  }
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const StyledP = styled.p`
  padding: 0;
  font-size: 16px;
  flex: 1;
  color: ${({ theme }) => theme.primaryText};
`;

const StyledRadio = styled(Radio)`
  align-self: center;
  padding-left: 16px;
  > input {
    display: none;
  }
  > span {
    transform: translateY(-50%);
  }
`;

const Label = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
`;

const StyledNumberField = styled(NumberInputField)`
  max-width: 128px;
  input {
    border: 1px solid ${({ theme, variant }) => (variant === "error" ? theme.error : theme.stroke)};
  }
`;

const ErrorMsg = styled.small`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.error};
`;

interface ICreationCard {
  cardMethod: CreationMethod;
  selectedMethod: CreationMethod;
  setCreationMethod: (method: CreationMethod) => void;
  disputeID?: string;
  setDisputeID?: (id?: string) => void;
  isInvalidDispute?: boolean;
}

const CreationCard: React.FC<ICreationCard> = ({
  cardMethod,
  selectedMethod,
  setCreationMethod,
  disputeID,
  setDisputeID,
  isInvalidDispute,
}) => {
  return (
    <StyledCard hover onClick={() => setCreationMethod(cardMethod)} selected={cardMethod === selectedMethod}>
      <CardTopContent>
        <Icon as={cardMethod === CreationMethod.Scratch ? CaseFromScratchIcon : DuplicateCaseIcon} />
        <StyledP>
          {cardMethod === CreationMethod.Scratch ? "Create a case from scratch" : "Duplicate an existing case"}
        </StyledP>
        <StyledRadio label="" checked={cardMethod === selectedMethod} onChange={() => setCreationMethod(cardMethod)} />
      </CardTopContent>
      {cardMethod === CreationMethod.Duplicate && selectedMethod === CreationMethod.Duplicate ? (
        <>
          <Divider />
          <CardBottomContent>
            <WithHelpTooltip tooltipMsg={'The case ID can be found on the top left of the Case page. eg. "Case #300".'}>
              <Label>{"Enter the cases's ID"}</Label>
            </WithHelpTooltip>
            <StyledNumberField
              placeholder="eg. 45"
              value={disputeID}
              onChange={(val) => {
                if (setDisputeID) setDisputeID(val.trim() !== "" ? val : undefined);
              }}
              variant={isInvalidDispute ? "error" : undefined}
            />
            {isInvalidDispute ? <ErrorMsg>Invalid dispute</ErrorMsg> : null}
          </CardBottomContent>
        </>
      ) : null}
    </StyledCard>
  );
};

export default CreationCard;
