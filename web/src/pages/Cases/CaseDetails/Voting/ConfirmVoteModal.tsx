import React from "react";
import styled from "styled-components";

import Modal from "react-modal";

import { Button } from "@kleros/ui-components-library";

import { isUndefined } from "utils/index";

import { customScrollbar } from "styles/customScrollbar";

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
  white-space: pre-wrap;
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
  /** Justification text. Undefined for commit flows, where it is only provided at reveal. */
  justification?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmVoteModal: React.FC<IConfirmVoteModal> = ({ isOpen, choice, justification, onConfirm, onCancel }) => (
  <StyledModal
    {...{ isOpen }}
    shouldCloseOnEsc
    shouldCloseOnOverlayClick
    onRequestClose={onCancel}
    role="dialog"
    aria={{ labelledby: "confirm-vote-title", describedby: "confirm-vote-description" }}
  >
    <h3 id="confirm-vote-title">Confirm your vote</h3>

    <Description id="confirm-vote-description">
      Please review your choice before submitting. Once sent, this cannot be undone.
    </Description>

    <Section>
      <Label>Your choice</Label>
      <ChoiceDisplay dir="auto">
        <strong>{choice}</strong>
      </ChoiceDisplay>
    </Section>

    {isUndefined(justification) ? (
      <Description>You will provide your justification when revealing your vote.</Description>
    ) : (
      <Section>
        <Label>Your justification</Label>
        <ChoiceDisplay dir="auto">
          {justification.trim() === "" ? <em>No justification provided</em> : justification}
        </ChoiceDisplay>
      </Section>
    )}

    <ButtonArea>
      <Button variant="secondary" text="Cancel" onClick={onCancel} />
      <Button text="Confirm vote" onClick={onConfirm} />
    </ButtonArea>
  </StyledModal>
);

export default ConfirmVoteModal;
