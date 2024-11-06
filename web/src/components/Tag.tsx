import React from "react";
import styled from "styled-components";

import { Tag as BaseTag } from "@kleros/ui-components-library";

interface ITag {
  text: string;
  active: boolean;
  onClick: () => void;
}

const TagContainer = styled.button`
  padding: 0;
  border: none;
  background-color: transparent;
`;

const Tag: React.FC<ITag> = ({ text, active, onClick }) => {
  return (
    <TagContainer onClick={onClick}>
      <BaseTag text={text} active={active} />
    </TagContainer>
  );
};

export default Tag;
