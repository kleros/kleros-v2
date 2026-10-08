import React from "react";

import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import { Button } from "@kleros/ui-components-library";

import { isUndefined } from "utils/index";

import MarkdownRenderer from "components/MarkdownRenderer";

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
    <Modal
      {...{ isOpen }}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      onRequestClose={onCancel}
      role="dialog"
      aria={{ labelledby: "confirm-vote-title", describedby: "confirm-vote-description" }}
      className="absolute top-[50%] left-[50%] [transform:translate(-50%,_-50%)] h-auto max-h-[90vh] w-[min(90%,_480px)] border border-solid border-klerosUIComponentsStroke rounded-[3px] bg-klerosUIComponentsWhiteBackground p-6 overflow-y-auto"
    >
      <h3 id="confirm-vote-title">{t("voting.confirm_your_vote")}</h3>

      <p id="confirm-vote-description" className="text-klerosUIComponentsSecondaryText m-0 text-[14px]">
        {t("voting.confirm_vote_message")}
      </p>

      <div className="flex flex-col gap-1 m-[16px_0]">
        <small className="text-klerosUIComponentsSecondaryText font-semibold text-[14px]">
          {t("voting.your_choice")}
        </small>
        <div
          dir="auto"
          className="text-klerosUIComponentsPrimaryText bg-klerosUIComponentsLightGrey border border-solid border-klerosUIComponentsStroke rounded-[3px] p-3 max-h-[240px] overflow-y-auto [overflow-wrap:break-word] custom-scrollbar"
        >
          <strong>{choice}</strong>
        </div>
      </div>

      {isUndefined(justification) ? null : (
        <div className="flex flex-col gap-1 m-[16px_0]">
          <small className="text-klerosUIComponentsSecondaryText font-semibold text-[14px]">
            {t("voting.your_justification")}
          </small>
          <div
            dir="auto"
            className="text-klerosUIComponentsPrimaryText bg-klerosUIComponentsLightGrey border border-solid border-klerosUIComponentsStroke rounded-[3px] p-3 max-h-[240px] overflow-y-auto [overflow-wrap:break-word] custom-scrollbar"
          >
            {justification.trim() === "" ? <em>{t("voting.no_justification_provided")}</em> : null}
            <MarkdownRenderer content={justification} />
          </div>
        </div>
      )}

      {isUndefined(justification) && hint ? (
        <p className="text-klerosUIComponentsSecondaryText m-0 text-[14px]">{hint}</p>
      ) : null}

      <div className="flex justify-between gap-3 mt-4">
        <Button variant="secondary" text={t("buttons.cancel")} onPress={onCancel} />
        <Button text={t("buttons.confirm_vote")} onPress={onConfirm} />
      </div>
    </Modal>
  );
};

export default ConfirmVoteModal;
