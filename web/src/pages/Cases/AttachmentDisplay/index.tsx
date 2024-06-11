import React from "react";
import styled from "styled-components";

import { useSearchParams } from "react-router-dom";

import FileViewer from "components/FileViewer";

import Header from "./Header";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 47px;
`;

const DisplayContainer = styled.div`
  background-color: ${({ theme }) => theme.whiteBackground};
  border-radius: 3px;
  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.06);
  overflow: scroll hidden;
`;

const EvidenceAttachmentDisplay: React.FC = () => {
  const [searchParams] = useSearchParams();

  const url = searchParams.get("url");
  return (
    <Container>
      <Header />
      <DisplayContainer>{url ? <FileViewer url={url} /> : null}</DisplayContainer>
    </Container>
  );
};

export default EvidenceAttachmentDisplay;
