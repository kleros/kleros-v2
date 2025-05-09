import React from "react";
import styled, { css } from "styled-components";

import { useAtlasProvider, Roles } from "@kleros/kleros-app";
import { FileUploader } from "@kleros/ui-components-library";

import PolicyIcon from "svgs/icons/policy.svg";

import { useNewDisputeContext } from "context/NewDisputeContext";
import useIsDesktop from "hooks/useIsDesktop";
import { getIpfsUrl } from "utils/getIpfsUrl";
import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

import { getFileUploaderMsg, isUndefined } from "src/utils";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { InternalLink } from "components/InternalLink";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${landscapeStyle(
    () => css`
      padding-bottom: 82px;
    `
  )}
`;

const StyledLabel = styled.label`
  width: 84vw;
  margin-bottom: 48px;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const StyledFileUploader = styled(FileUploader)`
  width: 84vw;
  margin-bottom: ${responsiveSize(150, 72)};

  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
  small {
    white-space: pre-line;
    text-align: start;
  }
`;

const StyledPolicyIcon = styled(PolicyIcon)`
  width: 16px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

const StyledInternalLink = styled(InternalLink)`
  ${hoverShortTransitionTiming}
  display: flex;
  gap: 4px;
  align-self: flex-start;
  margin-bottom: 32px;
  margin-top: 32px;
  &:hover {
    svg {
      fill: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

const Policy: React.FC = () => {
  const { disputeData, setDisputeData, setIsPolicyUploading } = useNewDisputeContext();
  const { uploadFile, roleRestrictions } = useAtlasProvider();
  const isDesktop = useIsDesktop();
  const handleFileUpload = (file: File) => {
    setIsPolicyUploading(true);
    infoToast("Uploading Policy to IPFS");

    uploadFile(file, Roles.Policy)
      .then(async (cid) => {
        if (!cid) return;
        successToast("Uploaded successfully!");
        setDisputeData({ ...disputeData, policyURI: cid });
      })
      .catch((err) => {
        console.log(err);
        errorToast(`Upload failed: ${err?.message}`);
      })
      .finally(() => setIsPolicyUploading(false));
  };

  return (
    <Container>
      <Header text="Submit the Policy File" />
      <StyledLabel>
        Fundamental to any case, the Policy provides jurors with a framework to vote fairly. It can be a set of
        criteria, a contract stating the rights and duties of the parties, or any set of pre-defined rules that are
        relevant to jurors' decision-making.
      </StyledLabel>

      <StyledFileUploader
        callback={handleFileUpload}
        variant={isDesktop ? "info" : undefined}
        msg={`You can attach additional information here. Important: the above description must reference the relevant parts of the file content.\n${getFileUploaderMsg(Roles.Policy, roleRestrictions)}`}
      />
      {!isUndefined(disputeData.policyURI) ? (
        <StyledInternalLink to={`/attachment/?title=${"Policy File"}&&url=${getIpfsUrl(disputeData.policyURI)}`}>
          <StyledPolicyIcon />
          Inspect the uploaded policy
        </StyledInternalLink>
      ) : null}
      <NavigationButtons prevRoute="/resolver/notable-persons" nextRoute="/resolver/preview" />
    </Container>
  );
};
export default Policy;
