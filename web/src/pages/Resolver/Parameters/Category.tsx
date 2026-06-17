import React, { useRef, useEffect } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { TextField } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

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
      padding-bottom: 191px;
    `
  )}
`;

const StyledField = styled(TextField)`
  width: 84vw;
  margin-bottom: 74px;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
      margin-bottom: 64px;
    `
  )}
  > span {
    margin-top: 16px;
  }
`;

const Category: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWrite = (value: string) => {
    setDisputeData({ ...disputeData, category: value });
  };

  useEffect(() => {
    if (containerRef.current) {
      const inputElement = containerRef.current.querySelector("input");
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, []);

  return (
    <Container ref={containerRef}>
      <Header text={t("headers.choose_a_category")} />
      <StyledField
        inputProps={{ dir: "auto" }}
        onChange={handleWrite}
        value={disputeData.category}
        placeholder={t("forms.placeholders.freelance_example")}
        variant="info"
        message={t("forms.messages.type_category_tag")}
      />
      <NavigationButtons prevRoute="/resolver/court" nextRoute="/resolver/jurors" />
    </Container>
  );
};

export default Category;
