import React, { lazy, Suspense } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import NewTabIcon from "svgs/icons/new-tab.svg";

import { getAllowedAttachmentUrl } from "utils/urlValidation";

import { MAX_WIDTH_LANDSCAPE } from "styles/landscapeStyle";

import { ExternalLink } from "components/ExternalLink";
import Loader from "components/Loader";

import Header from "./Header";

const FileViewer = lazy(() => import("components/FileViewer"));

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: calc(24px + (136 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-top: calc(32px + (80 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-bottom: calc(76px + (96 - 76) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  max-width: ${MAX_WIDTH_LANDSCAPE};
  margin: 0 auto;
`;

const AttachmentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LoaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: center;
  align-self: flex-end;
  gap: 8px;
`;

const StyledNewTabIcon = styled(NewTabIcon)`
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const UrlBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UrlLabel = styled.small`
  color: ${({ theme }) => theme.secondaryText};
  font-weight: 600;
`;

const UrlContainer = styled.div`
  background-color: ${({ theme }) => theme.lightGrey};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 4px;
  padding: 12px;
  word-break: break-all;
`;

const Url = styled.code`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 13px;
  font-family: monospace;
`;

const AttachmentDisplay: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const url = searchParams.get("url");
  const safeUrl = url ? getAllowedAttachmentUrl(url) : null;
  const titleKey = searchParams.get("title");
  const title = titleKey ? t(titleKey) : t("misc.attachment");
  return (
    <Container>
      <AttachmentContainer>
        <Header {...{ title }} />
        {safeUrl ? (
          <>
            <StyledExternalLink to={safeUrl} rel="noreferrer" target="_blank">
              {t("misc.open_in_new_tab")} <StyledNewTabIcon />
            </StyledExternalLink>
            <Suspense
              fallback={
                <LoaderContainer>
                  <Loader width={"48px"} height={"48px"} />
                </LoaderContainer>
              }
            >
              <FileViewer url={safeUrl} />
            </Suspense>
          </>
        ) : null}

        {url && !safeUrl ? (
          <UrlBlock>
            <UrlLabel>{t("errors.invalid_link")}</UrlLabel>
            <UrlContainer>
              <Url>{url}</Url>
            </UrlContainer>
          </UrlBlock>
        ) : null}
      </AttachmentContainer>
    </Container>
  );
};

export default AttachmentDisplay;
