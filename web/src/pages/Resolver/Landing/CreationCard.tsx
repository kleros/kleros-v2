import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { Card, CustomRadioItem, RadioIndicator } from "@kleros/ui-components-library";

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

const StyledItem = styled(CustomRadioItem)`
  width: 100%;
`;

const CardTopContent = styled.div`
  width: 100%;
  padding: 12px ${responsiveSize(16, 24)};
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

const StyledRadioIndicator = styled(RadioIndicator)`
  align-self: center;
  margin-left: 16px;
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
  disputeID?: string;
  setDisputeID?: (id?: string) => void;
  isInvalidDispute?: boolean;
}

const CreationCard: React.FC<ICreationCard> = ({
  cardMethod,
  selectedMethod,
  disputeID,
  setDisputeID,
  isInvalidDispute,
}) => {
  const { t } = useTranslation();
  const selected = cardMethod === selectedMethod;

  return (
    <StyledCard hover selected={selected}>
      <StyledItem value={String(cardMethod)}>
        {(rp) => (
          <CardTopContent>
            <Icon as={cardMethod === CreationMethod.Scratch ? CaseFromScratchIcon : DuplicateCaseIcon} />
            <StyledP>
              {cardMethod === CreationMethod.Scratch
                ? t("case_creation.create_from_scratch")
                : t("case_creation.duplicate_existing_case")}
            </StyledP>
            <StyledRadioIndicator {...rp} />
          </CardTopContent>
        )}
      </StyledItem>
      {cardMethod === CreationMethod.Duplicate && selected ? (
        <>
          <Divider />
          <CardBottomContent>
            <WithHelpTooltip tooltipMsg={t("case_creation.case_id_tooltip")}>
              <Label>{t("forms.labels.enter_cases_id")}</Label>
            </WithHelpTooltip>
            <StyledNumberField
              placeholder={t("forms.placeholders.case_id_example")}
              value={disputeID}
              onChange={(val) => {
                if (setDisputeID) setDisputeID(val.trim() !== "" ? val : undefined);
              }}
              variant={isInvalidDispute ? "error" : undefined}
            />
            {isInvalidDispute ? <ErrorMsg>{t("forms.messages.invalid_dispute")}</ErrorMsg> : null}
          </CardBottomContent>
        </>
      ) : null}
    </StyledCard>
  );
};

export default CreationCard;
