import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { useAtlasProvider } from "@kleros/kleros-app";
import { AlertMessage, Button } from "@kleros/ui-components-library";

import { EMAIL_REGEX } from "consts/index";
import { cn } from "utils/cn";
import { timeLeftUntil } from "utils/date";
import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import InfoCard from "components/InfoCard";

import { ISettings } from "../../../../index";

import EmailVerificationInfo from "./EmailVerificationInfo";
import FormContact from "./FormContact";

const UnsubscribeButton = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Button>) => (
  <Button
    {...props}
    className={cn(
      "[transition:0.1s] bg-klerosUIComponentsError border border-solid border-klerosUIComponentsError",
      "[&_.button-text]:text-klerosUIComponentsWhite! [&_p]:text-klerosUIComponentsWhite!",
      "[&:hover]:[opacity:75%] [&:hover]:[background:var(--klerosUIComponentsError)]!",
      className
    )}
  />
);

// Remount the confirmation control so focus does not carry over from the initial unsubscribe action.
const ConfirmUnsubscribeButton = (props: React.ComponentPropsWithoutRef<typeof Button>) => (
  <UnsubscribeButton {...props} />
);

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
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full relative flex flex-col",
        "p-[0_calc(12px_+_(32_-_12)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))] pb-4 gap-4"
      )}
    >
      <div className="flex flex-col">
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
      </div>
      {!isEmailUpdateable && user?.emailUpdateableAt ? (
        <InfoCard
          msg={t("notifications.update_email_again", { time: timeLeftUntil(user.emailUpdateableAt) })}
          className="w-fit text-[14px] mb-2 [word-wrap:break-word]"
        />
      ) : null}
      {isConfirmingUnsubscribe ? (
        <AlertMessage
          title={t("notifications.unsubscribe_warning_title")}
          msg={t("notifications.unsubscribe_warning_msg")}
          variant="warning"
        />
      ) : null}
      <div className="flex [flex-direction:row-reverse] flex-wrap justify-between gap-2">
        {isConfirmingUnsubscribe ? (
          <>
            <Button
              text={t("buttons.cancel")}
              variant="secondary"
              onPress={() => setIsConfirmingUnsubscribe(false)}
              isDisabled={isDeletingUser}
            />
            <ConfirmUnsubscribeButton
              text={t("buttons.confirm_unsubscribe")}
              onPress={handleConfirmUnsubscribe}
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
                onPress={() => setIsConfirmingUnsubscribe(true)}
                isDisabled={isFetchingUser || isDeletingUser}
              />
            ) : null}
          </>
        )}
      </div>
      <EmailVerificationInfo toggleIsSettingsOpen={toggleIsSettingsOpen} />
    </form>
  );
};

export default FormContactDetails;
