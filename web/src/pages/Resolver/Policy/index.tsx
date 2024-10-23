import React from "react";
import styled, { css } from "styled-components";

import { toast } from "react-toastify";

import { FileUploader } from "@kleros/ui-components-library";

import { useAtlasProvider } from "context/AtlasProvider";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { Roles } from "utils/atlas";
import { OPTIONS as toastOptions } from "utils/wrapWithToast";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

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
  margin-bottom: ${responsiveSize(52, 32)};

  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const Policy: React.FC = () => {
  const { disputeData, setDisputeData, setIsPolicyUploading } = useNewDisputeContext();
  const { uploadFile } = useAtlasProvider();

  const handleFileUpload = (file: File) => {
    setIsPolicyUploading(true);
    toast.info("Uploading Policy to IPFS", toastOptions);

    uploadFile(file, Roles.Policy)
      .then(async (cid) => {
        if (!cid) return;
        setDisputeData({ ...disputeData, policyURI: cid });
      })
      .catch((err) => console.log(err))
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
        variant="info"
        msg="You can attach additional information as a PDF file. Important: the above description must reference the relevant parts of the file content."
      />

      <NavigationButtons prevRoute="/resolver/notable-persons" nextRoute="/resolver/preview" />
    </Container>
  );
};
export default Policy;
