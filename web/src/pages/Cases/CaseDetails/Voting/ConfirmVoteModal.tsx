import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import { Button } from "@kleros/ui-components-library";

import { isUndefined } from "utils/index";

import { customScrollbar } from "styles/customScrollbar";

import MarkdownRenderer from "components/MarkdownRenderer";

const StyledModal = styled(Modal)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: auto;
  max-height: 90vh;
  width: min(90%, 480px);
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 24px;
  overflow-y: auto;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
  font-size: 14px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 16px 0;
`;

const Label = styled.small`
  color: ${({ theme }) => theme.secondaryText};
  font-weight: 600;
  font-size: 14px;
`;

const ChoiceDisplay = styled.div`
  color: ${({ theme }) => theme.primaryText};
  background-color: ${({ theme }) => theme.lightGrey};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  padding: 12px;
  max-height: 240px;
  overflow-y: auto;
  overflow-wrap: break-word;
  ${customScrollbar}
`;

const ButtonArea = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
`;

interface IConfirmVoteModal {
  isOpen: boolean;
  /** Title of the answer the juror picked. */
  choice: string;
  /** Justification markdown. Omit when this step does not collect one. */
  justification?: string;
  /**
   * Optional note shown in place of the justification section when no justification is collected here.
   * The modal makes no assumption about why a justification is absent.
   */
  hint?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmVoteModal: React.FC<IConfirmVoteModal> = ({
  isOpen,
  choice,
  justification,
  hint,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <StyledModal
      {...{ isOpen }}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      onRequestClose={onCancel}
      role="dialog"
      aria={{ labelledby: "confirm-vote-title", describedby: "confirm-vote-description" }}
    >
      <h3 id="confirm-vote-title">{t("voting.confirm_your_vote")}</h3>

      <Description id="confirm-vote-description">{t("voting.confirm_vote_message")}</Description>

      <Section>
        <Label>{t("voting.your_choice")}</Label>
        <ChoiceDisplay dir="auto">
          <strong>{choice}</strong>
        </ChoiceDisplay>
      </Section>

      {isUndefined(justification) ? null : (
        <Section>
          <Label>{t("voting.your_justification")}</Label>
          <ChoiceDisplay dir="auto">
            {justification.trim() === "" ? <em>{t("voting.no_justification_provided")}</em> : null}
            <MarkdownRenderer content={justification} />
          </ChoiceDisplay>
        </Section>
      )}

      {isUndefined(justification) && hint ? <Description>{hint}</Description> : null}

      <ButtonArea>
        <Button variant="secondary" text={t("buttons.cancel")} onClick={onCancel} />
        <Button text={t("buttons.confirm_vote")} onClick={onConfirm} />
      </ButtonArea>
    </StyledModal>
  );
};

export default ConfirmVoteModal;
