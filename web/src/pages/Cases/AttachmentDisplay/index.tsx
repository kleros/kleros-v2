import React, { lazy, Suspense } from "react";
import styled from "styled-components";

import { useSearchParams } from "react-router-dom";

import Loader from "components/Loader";

import Header from "./Header";

const FileViewer = lazy(() => import("components/FileViewer"));

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
  overflow: scroll;
  max-height: 750px;
`;

const LoaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const EvidenceAttachmentDisplay: React.FC = () => {
  const [searchParams] = useSearchParams();

  const url = searchParams.get("url");
  return (
    <Container>
      <Header />
      {url ? (
        <Suspense
          fallback={
            <LoaderContainer>
              <Loader width={"48px"} height={"48px"} />
            </LoaderContainer>
          }
        >
          <DisplayContainer>
            <FileViewer url={url} />
          </DisplayContainer>
        </Suspense>
      ) : null}
    </Container>
  );
};

export default EvidenceAttachmentDisplay;
