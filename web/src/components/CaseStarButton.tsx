import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { Button, Tooltip } from "@kleros/ui-components-library";

import Star from "svgs/icons/star.svg";

import useIsDesktop from "hooks/useIsDesktop";
import useStarredCases from "hooks/useStarredCases";

const StyledButton = styled(Button)<{ starred: boolean }>`
  background: none;
  padding: 0 0 2px 0;

  .button-svg {
    width: 24px;
    height: 24px;
    margin: 0;
    fill: none;

    path {
      stroke: ${({ theme }) => theme.secondaryPurple};
    }
    ${({ starred }) =>
      starred &&
      css`
        fill: ${({ theme }) => theme.secondaryPurple};
      `};
  }

  :hover {
    background: none;
  }
`;

const CaseStarButton: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation();
  const { starredCases, starCase } = useStarredCases();
  const isDesktop = useIsDesktop();
  const starred = useMemo(() => Boolean(starredCases.has(id)), [id, starredCases]);
  const text = starred ? t("misc.remove_from_favorites") : t("misc.add_to_favorites");
  return (
    <Tooltip {...{ text }} place={isDesktop ? "right" : "bottom"}>
      <StyledButton
        Icon={Star}
        text=""
        starred={starred}
        aria-label={text}
        aria-checked={starred}
        onClick={(e) => {
          e.stopPropagation();
          starCase(id);
        }}
      />
    </Tooltip>
  );
};

export default CaseStarButton;
