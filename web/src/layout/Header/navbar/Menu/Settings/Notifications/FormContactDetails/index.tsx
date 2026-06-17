import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { useAtlasProvider } from "@kleros/kleros-app";
import { AlertMessage, Button } from "@kleros/ui-components-library";

import { EMAIL_REGEX } from "consts/index";
import { timeLeftUntil } from "utils/date";
import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { responsiveSize } from "styles/responsiveSize";

import InfoCard from "components/InfoCard";

import { ISettings } from "../../../../index";

import EmailVerificationInfo from "./EmailVerificationInfo";
import FormContact from "./FormContact";

const FormContainer = styled.form`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 ${responsiveSize(12, 32, 300)};
  padding-bottom: 16px;
  gap: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  gap: 8px;
`;

const FormContactContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledInfoCard = styled(InfoCard)`
  width: fit-content;
  font-size: 14px;
  margin-bottom: 8px;
  word-wrap: break-word;
`;

const UnsubscribeButton = styled(Button)`
  ${hoverShortTransitionTiming}
  background-color: ${({ theme }) => theme.error};
  border: 1px solid ${({ theme }) => theme.error};

  .button-text,
  p {
    color: ${({ theme }) => theme.white} !important;
  }

  &:hover {
    opacity: 75%;
    background: ${({ theme }) => theme.error} !important;
  }
`;

const ConfirmUnsubscribeButton = styled(UnsubscribeButton)`
  .button-text,
  p {
    color: ${({ theme }) => theme.white} !important;
  }
`;

const FormContactDetails: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  const { t } = useTranslation();
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);
  const [isConfirmingUnsubscribe, setIsConfirmingUnsubscribe] = useState(false);
  const { address } = useAccount();
  const {
    user,
    isAddingUser,
    isFetchingUser,
    addUser,
    updateEmail,
    isUpdatingUser,
    userExists,
    deleteUser,
    isDeletingUser,
  } = useAtlasProvider();

  const isEditingEmail = user?.email !== emailInput;

  const isEmailUpdateable = user?.email
    ? !isUndefined(user?.emailUpdateableAt) && new Date(user.emailUpdateableAt).getTime() < new Date().getTime()
    : true;

  useEffect(() => {
    if (!user || !userExists) return;

    setEmailInput(user.email);
  }, [user, userExists]);

  const handleConfirmUnsubscribe = useCallback(async () => {
    if (isUndefined(address)) return;
    infoToast(t("notifications.unsubscribing"));
    deleteUser()
      .then((res) => {
        if (!res) {
          errorToast(t("notifications.unsubscribe_failed_error", { error: t("errors.something_went_wrong") }));
          return;
        }
        setEmailInput("");
        setIsConfirmingUnsubscribe(false);
        successToast(t("notifications.unsubscribed_successfully"));
        toggleIsSettingsOpen();
      })
      .catch((err) => {
        console.error(err);
        errorToast(t("notifications.unsubscribe_failed_error", { error: err?.message }));
      });
  }, [address, deleteUser, t, toggleIsSettingsOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) {
      return;
    }

    // if user exists then update email
    if (userExists) {
      if (!isEmailUpdateable) return;
      const data = {
        newEmail: emailInput,
      };
      infoToast(t("notifications.updating_email"));
      updateEmail(data)
        .then(async (res) => {
          if (res) {
            successToast(t("notifications.email_updated_successfully"));
            toggleIsSettingsOpen();
          }
        })
        .catch((err) => {
          console.error(err);
          errorToast(t("notifications.updating_email_failed_error", { error: err?.message }));
        });
    } else {
      const data = {
        email: emailInput,
      };
      infoToast(t("notifications.adding_user"));
      addUser(data)
        .then(async (res) => {
          if (res) {
            successToast(t("notifications.user_added_successfully"));
            toggleIsSettingsOpen();
          }
        })
        .catch((err) => {
          console.error(err);
          errorToast(t("notifications.adding_user_failed_error", { error: err?.message }));
        });
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormContactContainer>
        <FormContact
          contactLabel={t("forms.labels.email")}
          contactPlaceholder={t("forms.placeholders.email_example")}
          contactInput={emailInput}
          contactIsValid={emailIsValid}
          setContactInput={setEmailInput}
          setContactIsValid={setEmailIsValid}
          validator={EMAIL_REGEX}
          isEditing={isEditingEmail}
          isDisabled={!isEmailUpdateable}
        />
      </FormContactContainer>
      {!isEmailUpdateable && user?.emailUpdateableAt ? (
        <StyledInfoCard msg={t("notifications.update_email_again", { time: timeLeftUntil(user.emailUpdateableAt) })} />
      ) : null}
      {isConfirmingUnsubscribe ? (
        <AlertMessage
          title={t("notifications.unsubscribe_warning_title")}
          msg={t("notifications.unsubscribe_warning_msg")}
          variant="warning"
        />
      ) : null}
      <ButtonContainer>
        {isConfirmingUnsubscribe ? (
          <>
            <Button
              text={t("buttons.cancel")}
              variant="secondary"
              onClick={(event) => {
                event.preventDefault();
                setIsConfirmingUnsubscribe(false);
              }}
              isDisabled={isDeletingUser}
            />
            <ConfirmUnsubscribeButton
              text={t("buttons.confirm_unsubscribe")}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmUnsubscribe();
              }}
              isDisabled={isFetchingUser || isDeletingUser}
              isLoading={isDeletingUser}
            />
          </>
        ) : (
          <>
            <Button
              type="submit"
              text={t("buttons.save")}
              isDisabled={
                !isEditingEmail ||
                !emailIsValid ||
                isAddingUser ||
                isFetchingUser ||
                isUpdatingUser ||
                isDeletingUser ||
                !isEmailUpdateable
              }
            />
            {userExists ? (
              <UnsubscribeButton
                variant="secondary"
                text={t("buttons.unsubscribe")}
                onClick={(event) => {
                  event.preventDefault();
                  setIsConfirmingUnsubscribe(true);
                }}
                isDisabled={isFetchingUser || isDeletingUser}
              />
            ) : null}
          </>
        )}
      </ButtonContainer>
      <EmailVerificationInfo toggleIsSettingsOpen={toggleIsSettingsOpen} />
    </FormContainer>
  );
};

export default FormContactDetails;
