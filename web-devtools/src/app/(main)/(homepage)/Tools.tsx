import React from "react";
import styled from "styled-components";

import Link from "next/link";

import PaperIcon from "svgs/icons/arrow.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border-top: 3px solid ${({ theme }) => theme.klerosUIComponentsSecondaryPurple};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  padding: 16px;
`;

const ToolList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ToolItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 16px;
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsLightBlue};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.klerosUIComponentsLightBackground};
  width: 100%;
  transition: background-color 0.3s;
`;

const ToolLink = styled.div`
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 8px;
  color: ${({ theme }) => theme.klerosUIComponentsSecondaryText};
  width: 100%;
`;

const SVGContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    fill: ${({ theme }) => theme.klerosUIComponentsSecondaryPurple};
    height: 12px;
    width: 12px;
  }
`;

const ToolName = styled.span`
  font-size: 16px;
`;

const tools = [
  { name: "Dispute Templates Preview", route: "/dispute-template" },
  { name: "Configure Ruler", route: "/ruler" },
  { name: "Courts Manager (coming soon)", route: "/" },
  { name: "Arbitrable Explorer (coming soon)", route: "/" },
];

const Tools: React.FC = () => {
  return (
    <Container>
      <p>Tools</p>
      <ToolList>
        {tools.map((tool, index) => (
          <ToolItem key={index}>
            <Link href={tool.route} passHref>
              <ToolLink>
                <SVGContainer>
                  <PaperIcon />
                </SVGContainer>
                <ToolName>{tool.name}</ToolName>
              </ToolLink>
            </Link>
          </ToolItem>
        ))}
      </ToolList>
    </Container>
  );
};

export default Tools;
