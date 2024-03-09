import React from "react";
import type { LifiStep } from "@lifi/sdk";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledSVGContainer = styled.div`
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const Icon: React.FC<{ img: string }> = ({ img }) => {
  return (
    <StyledSVGContainer>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
        <image width="16" height="16" href={img} />
      </svg>
    </StyledSVGContainer>
  );
};

const ToolContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ToolName = styled.h3`
  margin: 0px;
  font-size: 14px;
`;

const ToolDetail: React.FC<{ logoUri: string; name: string }> = ({ logoUri, name }) => (
  <ToolContainer>
    <Icon img={logoUri} />
    <ToolName>{name}</ToolName>
  </ToolContainer>
);

interface IToolsInfo {
  steps: LifiStep[];
}

const ToolsInfo: React.FC<IToolsInfo> = ({ steps }) => {
  const tools = steps.reduce<LifiStep["toolDetails"][]>((acc, current) => {
    acc.push(current.toolDetails);
    return acc;
  }, []);

  return (
    <Container>
      {tools.map((tool, i) => (
        <>
          <ToolDetail logoUri={tool.logoURI} name={tool.name} key={tool.key} />
          {tools.length > 1 && i !== tools.length - 1 ? <label>{">"}</label> : null}
        </>
      ))}
    </Container>
  );
};

export default ToolsInfo;
