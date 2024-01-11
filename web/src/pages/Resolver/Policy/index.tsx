import React from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import NavigationButtons from "../NavigationButtons";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import { FileUploader } from "@kleros/ui-components-library";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { uploadFormDataToIPFS } from "utils/uploadFormDataToIPFS";
import { OPTIONS as toastOptions } from "utils/wrapWithToast";
import { toast } from "react-toastify";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

  const handleFileUpload = (file: File) => {
    setIsPolicyUploading(true);
    toast.info("Uploading Policy to IPFS", toastOptions);

    const fileFormData = new FormData();
    fileFormData.append("data", file, file.name);

    uploadFormDataToIPFS(fileFormData)
      .then(async (res) => {
        const response = await res.json();
        const policyURI = response["cids"][0];
        setDisputeData({ ...disputeData, policyURI });
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

      <NavigationButtons prevRoute="/resolver/notablepersons" nextRoute="/resolver/preview" />
    </Container>
  );
};
export default Policy;
