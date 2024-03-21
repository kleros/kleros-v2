import sgMail, { MailService } from "@sendgrid/mail";

export const createCourtMailer = (_sendGridClient: MailService, _frontEndUrl: string, _unsubscribeLink: string) => {
  const sgMail = _sendGridClient;
  const frontEndUrl = _frontEndUrl;
  const unsubscribeLink = _unsubscribeLink; // should be a link to the court's notification settings page
  const defaults = {
    from: "appsupport@kleros.builders",
    replyTo: "appsupport@kleros.io",
  };

  const getCasesUrl = (caseId: string) => `${frontEndUrl}/cases/${caseId}`;

  const notifySignUp = (to: string, onboardingUrl: string) => {
    const templateId = "d-409cfb5a26e1486fbaae8ca7975bf36b ";
    return send({
      to,
      templateId,
      dynamicTemplateData: {
        onboardingUrl,
        unsubscribeLink,
      },
    });
  };

  const notifyDrawnJuror = (to: string, caseId: string) => {
    const templateId = "d-db25f02c1b73499d90743c6cf2236890";
    return send({
      to,
      templateId,
      dynamicTemplateData: {
        caseId,
        caseUrl: getCasesUrl(caseId),
        unsubscribeLink,
      },
    });
  };

  const notifyReminderToVote = (to: string, caseId: string) => {
    const templateId = "d-c44e4a4e6c134008a7674fd3d778fee0";
    return send({
      to,
      templateId,
      dynamicTemplateData: {
        caseId,
        caseUrl: getCasesUrl(caseId),
        unsubscribeLink,
      },
    });
  };

  const notifyAppealPeriod = (to: string, caseId: string, winningChoice: string, appealEnd: string) => {
    const templateId = "d-3c912511364d4a2cb95eb97dd776019c";
    return send({
      to,
      templateId,
      dynamicTemplateData: {
        caseId,
        winningChoice,
        appealEnd,
        caseUrl: getCasesUrl(caseId),
        unsubscribeLink,
      },
    });
  };

  const notifyAppealed = (to: string, caseId: string, votingEnd: string) => {
    const templateId = "d-b610f2a021ad47f583449d74b27c7716";
    return send({
      to,
      templateId,
      dynamicTemplateData: {
        caseId,
        votingEnd,
        caseUrl: getCasesUrl(caseId),
        unsubscribeLink,
      },
    });
  };

  const notifyWinner = (to: string, caseId: string, rewards: string, ruling: string) => {
    const templateId = "d-ec75665e848e4e30b0678eda55ea0a2b";
    return send({
      to,
      templateId,
      dynamicTemplateData: {
        caseId,
        rewards,
        ruling,
        caseUrl: getCasesUrl(caseId),
        unsubscribeLink,
      },
    });
  };

  const notifyLoser = (to: string, caseId: string, penalty: string, ruling: string) => {
    const templateId = "d-248456f545c44a6f9496c4ce4e1fab4a";
    return send({
      to,
      templateId,
      dynamicTemplateData: {
        caseId,
        penalty,
        ruling,
        caseUrl: getCasesUrl(caseId),
        unsubscribeLink,
      },
    });
  };

  // https://github.com/sendgrid/sendgrid-nodejs/blob/main/docs/use-cases/transactional-templates.md
  // https://docs.sendgrid.com/api-reference/mail-send/mail-send#dynamic-transactional-templates-and-handlebars
  const send = (msg: any) => sgMail.send({ ...defaults, ...msg });

  return {
    notifySignUp,
    notifyDrawnJuror,
    notifyReminderToVote,
    notifyAppealPeriod,
    notifyAppealed,
    notifyWinner,
    send,
  };
};

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error("SENDGRID_API_KEY is not set");
}
sgMail.setApiKey(apiKey);
const courtMailer = createCourtMailer(
  sgMail,
  "https://v2.kleros.builders",
  "https://https://v2.kleros.builders/settings/notifications"
);

courtMailer
  // .notifySignUp("jb@kleros.io", "https://v2.kleros.builders/onboarding")
  .notifyAppealed("jb@kleros.io", "29", "March 25th at 3pm UTC")
  // .notifyWinner("jb@kleros.io", "29", "1 ETH and 10,000 PNK", "Ruling")
  // .notifyDrawnJuror("jb@kleros.io", "29")
  .then(() => {
    console.log("Email sent");
  })
  .catch((error) => {
    console.error(error);
  });
